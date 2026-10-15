// src/modules/issues/issues.service.js
import * as issuesRepository from './issues.repository.js';
import { pool } from '../../db/pool.js';
import { AppError } from '../../shared/app-error.js';

// Calculate due date based on category defaults or asset override
async function calculateDueDate(assetId) {
  const { rows } = await pool.query(
    `SELECT 
      COALESCE(a.loan_days_override, c.default_loan_days) as loan_days
     FROM assets a
     JOIN categories c ON a.category_id = c.id
     WHERE a.id = $1`,
    [assetId]
  );

  if (!rows[0]) {
    throw new AppError(404, 'NOT_FOUND', 'Asset not found');
  }

  const loanDays = rows[0].loan_days;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + loanDays);
  return dueDate;
}

// Check if asset is available for borrowing
async function checkAssetAvailability(assetId, requestedQuantity) {
  const { rows } = await pool.query(
    `SELECT 
      a.quantity as total_quantity,
      a.tracking,
      a.is_issuable,
      a.status,
      COALESCE(SUM(i.quantity) FILTER (WHERE i.status IN ('requested', 'active', 'dropped')), 0)::int as issued_quantity
     FROM assets a
     LEFT JOIN issues i ON a.id = i.asset_id
     WHERE a.id = $1
     GROUP BY a.id`,
    [assetId]
  );

  if (!rows[0]) {
    throw new AppError(404, 'NOT_FOUND', 'Asset not found');
  }

  const asset = rows[0];

  if (!asset.is_issuable) {
    throw new AppError(409, 'NOT_ISSUABLE', 'This asset is not available for borrowing');
  }

  if (asset.status !== 'available') {
    throw new AppError(409, 'NOT_AVAILABLE', `Asset status is ${asset.status}`);
  }

  const availableQuantity = asset.total_quantity - asset.issued_quantity;

  if (requestedQuantity > availableQuantity) {
    throw new AppError(409, 'INSUFFICIENT_QUANTITY', 
      `Only ${availableQuantity} unit(s) available, requested ${requestedQuantity}`);
  }

  return asset;
}

export async function createIssue(issueData, actorId) {
  // Use actor as borrower if not specified (self-borrow)
  const borrowerId = issueData.borrower_id || actorId;

  // Check if borrower is blocked
  const block = await issuesRepository.checkBorrowerBlocks(borrowerId);
  if (block) {
    throw new AppError(403, 'BORROWER_BLOCKED', 
      `Borrower is blocked: ${block.reason}. ${block.blocked_until ? `Until ${block.blocked_until}` : 'Indefinitely'}`);
  }

  // Check asset availability
  await checkAssetAvailability(issueData.asset_id, issueData.quantity);

  // Calculate due date
  const dueDate = await calculateDueDate(issueData.asset_id);

  const issue = await issuesRepository.createIssue({
    ...issueData,
    borrower_id: borrowerId,
    due_at: dueDate,
  });

  return issuesRepository.getIssueById(issue.id);
}

export async function listIssues({ limit, offset, filters }) {
  return issuesRepository.listIssues({ limit, offset, filters });
}

export async function getIssueById(id) {
  const issue = await issuesRepository.getIssueById(id);
  if (!issue) {
    throw new AppError(404, 'NOT_FOUND', 'Issue not found');
  }
  return issue;
}

export async function updateIssue(id, fields) {
  const issue = await issuesRepository.getIssueById(id);
  if (!issue) {
    throw new AppError(404, 'NOT_FOUND', 'Issue not found');
  }

  // Only allow updates before issue
  if (issue.status !== 'requested') {
    throw new AppError(409, 'INVALID_STATE', 'Can only update issues in requested state');
  }

  return issuesRepository.updateIssue(id, fields);
}

export async function issueAsset(issueId, issuedBy) {
  const issue = await issuesRepository.getIssueById(issueId);
  if (!issue) {
    throw new AppError(404, 'NOT_FOUND', 'Issue not found');
  }

  if (issue.status !== 'requested') {
    throw new AppError(409, 'INVALID_STATE_TRANSITION', 
      `Cannot issue from status ${issue.status}`);
  }

  // Re-check availability
  await checkAssetAvailability(issue.asset_id, issue.quantity);

  // Re-check borrower blocks
  const block = await issuesRepository.checkBorrowerBlocks(issue.borrower_id);
  if (block) {
    throw new AppError(403, 'BORROWER_BLOCKED', 
      `Borrower is blocked: ${block.reason}`);
  }

  const updated = await issuesRepository.updateIssue(issueId, {
    status: 'active',
    issued_at: new Date(),
    issued_by: issuedBy,
  });

  return issuesRepository.getIssueById(updated.id);
}

export async function dropIssue(issueId, dropBoxId) {
  const issue = await issuesRepository.getIssueById(issueId);
  if (!issue) {
    throw new AppError(404, 'NOT_FOUND', 'Issue not found');
  }

  if (issue.status !== 'active') {
    throw new AppError(409, 'INVALID_STATE_TRANSITION', 
      `Cannot drop from status ${issue.status}`);
  }

  // Verify drop box exists
  const { rows } = await pool.query(
    'SELECT id, is_active FROM drop_boxes WHERE id = $1',
    [dropBoxId]
  );

  if (!rows[0]) {
    throw new AppError(404, 'NOT_FOUND', 'Drop box not found');
  }

  if (!rows[0].is_active) {
    throw new AppError(409, 'DROP_BOX_INACTIVE', 'Drop box is not active');
  }

  const updated = await issuesRepository.updateIssue(issueId, {
    status: 'dropped',
    dropped_at: new Date(),
    drop_box_id: dropBoxId,
  });

  return issuesRepository.getIssueById(updated.id);
}

export async function receiveIssue(issueId, receiveData, receivedBy) {
  const issue = await issuesRepository.getIssueById(issueId);
  if (!issue) {
    throw new AppError(404, 'NOT_FOUND', 'Issue not found');
  }

  if (issue.status !== 'dropped') {
    throw new AppError(409, 'INVALID_STATE_TRANSITION', 
      `Cannot receive from status ${issue.status}. Item must be dropped first.`);
  }

  const updated = await issuesRepository.updateIssue(issueId, {
    status: 'returned',
    returned_at: new Date(),
    received_by: receivedBy,
    return_condition: receiveData.return_condition,
    remarks: receiveData.remarks || null,
  });

  return issuesRepository.getIssueById(updated.id);
}

export async function cancelIssue(issueId, cancellationReason) {
  const issue = await issuesRepository.getIssueById(issueId);
  if (!issue) {
    throw new AppError(404, 'NOT_FOUND', 'Issue not found');
  }

  if (issue.status !== 'requested') {
    throw new AppError(409, 'INVALID_STATE_TRANSITION', 
      'Can only cancel issues in requested state');
  }

  const updated = await issuesRepository.updateIssue(issueId, {
    status: 'cancelled',
    cancellation_reason: cancellationReason,
  });

  return issuesRepository.getIssueById(updated.id);
}

export async function renewIssue(issueId, renewalData, requestedBy) {
  const issue = await issuesRepository.getIssueById(issueId);
  if (!issue) {
    throw new AppError(404, 'NOT_FOUND', 'Issue not found');
  }

  if (issue.status !== 'active') {
    throw new AppError(409, 'INVALID_STATE', 
      'Can only renew active issues');
  }

  // Check max renewals
  if (issue.renewal_count >= issue.max_renewals) {
    throw new AppError(409, 'MAX_RENEWALS_REACHED', 
      `Maximum ${issue.max_renewals} renewals allowed`);
  }

  // Calculate new due date (add same loan days)
  const currentDue = new Date(issue.due_at);
  const newDueDate = new Date(currentDue);
  newDueDate.setDate(newDueDate.getDate() + issue.default_loan_days);

  // Create renewal record
  const { rows } = await pool.query(
    `INSERT INTO loan_renewals 
     (issue_id, requested_by, previous_due_at, new_due_at, status, reason, approved_by, decision_at)
     VALUES ($1, $2, $3, $4, 'approved', $5, $6, NOW())
     RETURNING *`,
    [issueId, requestedBy, issue.due_at, newDueDate, renewalData.reason || null, renewalData.approved_by || requestedBy]
  );

  // Update issue
  const updated = await issuesRepository.updateIssue(issueId, {
    due_at: newDueDate,
    renewal_count: issue.renewal_count + 1,
  });

  return {
    issue: await issuesRepository.getIssueById(updated.id),
    renewal: rows[0],
  };
}

export async function getOverdueIssues() {
  return issuesRepository.getOverdueIssues();
}

export async function getDroppedIssues() {
  return issuesRepository.getDroppedIssues();
}
