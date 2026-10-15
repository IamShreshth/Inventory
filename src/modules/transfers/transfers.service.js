// src/modules/transfers/transfers.service.js
import * as transfersRepository from './transfers.repository.js';
import { pool } from '../../db/pool.js';
import { withTransaction } from '../../db/transaction.js';
import { AppError } from '../../shared/app-error.js';
import { logAudit } from '../../shared/audit.service.js';

/**
 * List transfers with filters and pagination
 */
export async function listTransfers({ limit, offset, filters, sort }) {
  // Define allowed sort columns
  const sortColumns = {
    created_at: 't.created_at',
    requested_at: 't.requested_at',
    approved_at: 't.approved_at',
    status: 't.status',
  };

  let sortClause = 't.created_at DESC'; // Default sort

  if (sort) {
    const parts = sort.split(',').map(s => s.trim());
    const sortExpressions = [];

    for (const part of parts) {
      const descending = part.startsWith('-');
      const key = descending ? part.slice(1) : part;
      const column = sortColumns[key];

      if (!column) {
        throw new AppError('VALIDATION_ERROR', `Invalid sort field: ${key}`, 422);
      }

      sortExpressions.push(`${column} ${descending ? 'DESC' : 'ASC'}`);
    }

    sortClause = sortExpressions.join(', ');
  }

  return await transfersRepository.findTransfers({ filters, limit, offset, sort: sortClause });
}

/**
 * Get transfer by ID
 */
export async function getTransferById(id) {
  const transfer = await transfersRepository.findTransferById(id);

  if (!transfer) {
    throw new AppError('NOT_FOUND', 'Transfer not found', 404);
  }

  return transfer;
}

/**
 * Create a transfer request
 */
export async function createTransfer(transferData, requestedBy) {
  return withTransaction(async (client) => {
    // Validate from and to are different
    if (transferData.from_org_id && transferData.to_org_id && 
        transferData.from_org_id === transferData.to_org_id &&
        transferData.from_location_id === transferData.to_location_id) {
      throw new AppError('INVALID_TRANSFER', 'Source and destination cannot be the same', 409);
    }

    // Lock and check asset
    const assetResult = await client.query(
      `SELECT a.*, 
        COALESCE(SUM(i.quantity) FILTER (WHERE i.status IN ('requested', 'active', 'dropped')), 0)::int as issued_quantity,
        COALESCE(SUM(t.quantity) FILTER (WHERE t.status IN ('requested', 'approved')), 0)::int as transfer_quantity
       FROM assets a
       LEFT JOIN issues i ON a.id = i.asset_id
       LEFT JOIN transfers t ON a.id = t.asset_id
       WHERE a.id = $1
       GROUP BY a.id
       FOR UPDATE OF a`,
      [transferData.asset_id]
    );

    if (!assetResult.rows[0]) {
      throw new AppError('NOT_FOUND', 'Asset not found', 404);
    }

    const asset = assetResult.rows[0];
    const availableQuantity = asset.quantity - asset.issued_quantity - asset.transfer_quantity;

    if (transferData.quantity > availableQuantity) {
      throw new AppError('INSUFFICIENT_QUANTITY', 
        `Only ${availableQuantity} unit(s) available for transfer`, 409);
    }

    // Create transfer
    const transfer = await transfersRepository.createTransfer({
      ...transferData,
      requested_by: requestedBy,
    }, client);

    // Log audit
    await logAudit({
      table_name: 'transfers',
      record_id: transfer.id,
      action: 'create',
      changed_by: requestedBy,
      new_data: {
        asset_id: transfer.asset_id,
        quantity: transfer.quantity,
        from_org_id: transfer.from_org_id,
        to_org_id: transfer.to_org_id,
      },
    }, client);

    return transfersRepository.findTransferById(transfer.id, client);
  });
}

/**
 * Update transfer (only allowed before approval)
 */
export async function updateTransfer(id, updateData) {
  return withTransaction(async (client) => {
    const transfer = await transfersRepository.findTransferById(id, client);

    if (!transfer) {
      throw new AppError('NOT_FOUND', 'Transfer not found', 404);
    }

    if (transfer.status !== 'requested') {
      throw new AppError('INVALID_STATE', 
        'Can only update transfers in requested state', 409);
    }

    const updated = await transfersRepository.updateTransfer(id, updateData, client);
    return transfersRepository.findTransferById(updated.id, client);
  });
}

/**
 * Approve transfer
 */
export async function approveTransfer(id, approvedBy) {
  return withTransaction(async (client) => {
    // Lock and get transfer
    const transferResult = await client.query(
      'SELECT * FROM transfers WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (!transferResult.rows[0]) {
      throw new AppError('NOT_FOUND', 'Transfer not found', 404);
    }

    const transfer = transferResult.rows[0];

    if (transfer.status !== 'requested') {
      throw new AppError('INVALID_STATE_TRANSITION', 
        `Cannot approve transfer in ${transfer.status} state`, 409);
    }

    // Re-check asset availability
    const assetResult = await client.query(
      `SELECT a.*, 
        COALESCE(SUM(i.quantity) FILTER (WHERE i.status IN ('requested', 'active', 'dropped')), 0)::int as issued_quantity,
        COALESCE(SUM(t.quantity) FILTER (WHERE t.status IN ('requested', 'approved') AND t.id != $2), 0)::int as transfer_quantity
       FROM assets a
       LEFT JOIN issues i ON a.id = i.asset_id
       LEFT JOIN transfers t ON a.id = t.asset_id
       WHERE a.id = $1
       GROUP BY a.id
       FOR UPDATE OF a`,
      [transfer.asset_id, id]
    );

    const asset = assetResult.rows[0];
    const availableQuantity = asset.quantity - asset.issued_quantity - asset.transfer_quantity;

    if (transfer.quantity > availableQuantity) {
      throw new AppError('INSUFFICIENT_QUANTITY', 
        `Only ${availableQuantity} unit(s) available for transfer`, 409);
    }

    // Update transfer to approved
    await transfersRepository.updateTransfer(id, {
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date(),
    }, client);

    // Log audit
    await logAudit({
      table_name: 'transfers',
      record_id: id,
      action: 'approve',
      changed_by: approvedBy,
      new_data: {
        previous_status: 'requested',
        new_status: 'approved',
      },
    }, client);

    return transfersRepository.findTransferById(id, client);
  });
}

/**
 * Reject transfer
 */
export async function rejectTransfer(id, rejectedBy, rejectionReason) {
  return withTransaction(async (client) => {
    const transferResult = await client.query(
      'SELECT * FROM transfers WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (!transferResult.rows[0]) {
      throw new AppError('NOT_FOUND', 'Transfer not found', 404);
    }

    const transfer = transferResult.rows[0];

    if (transfer.status !== 'requested') {
      throw new AppError('INVALID_STATE_TRANSITION', 
        `Cannot reject transfer in ${transfer.status} state`, 409);
    }

    await transfersRepository.updateTransfer(id, {
      status: 'rejected',
      rejected_by: rejectedBy,
      rejected_at: new Date(),
      rejection_reason: rejectionReason,
    }, client);

    await logAudit({
      table_name: 'transfers',
      record_id: id,
      action: 'reject',
      changed_by: rejectedBy,
      new_data: {
        previous_status: 'requested',
        new_status: 'rejected',
        rejection_reason: rejectionReason,
      },
    }, client);

    return transfersRepository.findTransferById(id, client);
  });
}

/**
 * Complete transfer (actually move the asset)
 */
export async function completeTransfer(id, completedBy) {
  return withTransaction(async (client) => {
    const transferResult = await client.query(
      'SELECT * FROM transfers WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (!transferResult.rows[0]) {
      throw new AppError('NOT_FOUND', 'Transfer not found', 404);
    }

    const transfer = transferResult.rows[0];

    if (transfer.status !== 'approved') {
      throw new AppError('INVALID_STATE_TRANSITION', 
        `Cannot complete transfer in ${transfer.status} state. Must be approved first.`, 409);
    }

    // Lock asset and update its location/ownership
    const assetResult = await client.query(
      'SELECT * FROM assets WHERE id = $1 FOR UPDATE',
      [transfer.asset_id]
    );

    if (!assetResult.rows[0]) {
      throw new AppError('NOT_FOUND', 'Asset not found', 404);
    }

    // Update asset ownership/location
    const assetUpdates = {};
    if (transfer.to_org_id) assetUpdates.owner_org_id = transfer.to_org_id;
    if (transfer.to_location_id) assetUpdates.location_id = transfer.to_location_id;
    if (transfer.to_user_id) assetUpdates.responsible_user_id = transfer.to_user_id;

    if (Object.keys(assetUpdates).length > 0) {
      const updateFields = Object.keys(assetUpdates).map((key, i) => `${key} = $${i + 2}`).join(', ');
      await client.query(
        `UPDATE assets SET ${updateFields}, updated_at = NOW() WHERE id = $1`,
        [transfer.asset_id, ...Object.values(assetUpdates)]
      );
    }

    // Mark transfer as completed
    await transfersRepository.updateTransfer(id, {
      status: 'completed',
      completed_by: completedBy,
      completed_at: new Date(),
    }, client);

    await logAudit({
      table_name: 'transfers',
      record_id: id,
      action: 'complete',
      changed_by: completedBy,
      new_data: {
        previous_status: 'approved',
        new_status: 'completed',
        asset_updates: assetUpdates,
      },
    }, client);

    return transfersRepository.findTransferById(id, client);
  });
}

/**
 * Cancel transfer
 */
export async function cancelTransfer(id, cancelledBy, cancellationReason) {
  return withTransaction(async (client) => {
    const transferResult = await client.query(
      'SELECT * FROM transfers WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (!transferResult.rows[0]) {
      throw new AppError('NOT_FOUND', 'Transfer not found', 404);
    }

    const transfer = transferResult.rows[0];

    if (!['requested', 'approved'].includes(transfer.status)) {
      throw new AppError('INVALID_STATE_TRANSITION', 
        `Cannot cancel transfer in ${transfer.status} state`, 409);
    }

    await transfersRepository.updateTransfer(id, {
      status: 'cancelled',
      cancellation_reason: cancellationReason,
    }, client);

    await logAudit({
      table_name: 'transfers',
      record_id: id,
      action: 'cancel',
      changed_by: cancelledBy,
      new_data: {
        previous_status: transfer.status,
        new_status: 'cancelled',
        cancellation_reason: cancellationReason,
      },
    }, client);

    return transfersRepository.findTransferById(id, client);
  });
}
