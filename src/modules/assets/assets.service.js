import * as repository from './assets.repository.js';
import * as qrService from '../../shared/qr-token.service.js';
import { AppError } from '../../shared/app-error.js';
import { withTransaction } from '../../db/transaction.js';
import { stringify } from 'csv-stringify/sync';

export async function create(data) {
  // Validate unique constraints
  if (data.asset_tag) {
    const existing = await repository.getByAssetTag(data.asset_tag);
    if (existing) {
      throw new AppError('ASSET_TAG_EXISTS', 'Asset with this asset tag already exists', 409);
    }
  }

  if (data.serial_no) {
    const existing = await repository.getBySerialNo(data.serial_no);
    if (existing) {
      throw new AppError('SERIAL_NO_EXISTS', 'Asset with this serial number already exists', 409);
    }
  }

  // Validate tracking mode and quantity
  if (data.tracking === 'individual' && data.quantity !== 1) {
    throw new AppError('INVALID_QUANTITY', 'Individual tracked assets must have quantity of 1', 400);
  }

  return repository.create(data);
}

export async function batchCreate(assetsData) {
  return withTransaction(async (client) => {
    const created = [];
    const errors = [];

    for (let i = 0; i < assetsData.length; i++) {
      const assetData = assetsData[i];
      
      try {
        // Validate unique constraints
        if (assetData.asset_tag) {
          const { rows } = await client.query(
            'SELECT id FROM assets WHERE asset_tag = $1',
            [assetData.asset_tag]
          );
          if (rows.length > 0) {
            throw new Error(`Asset tag '${assetData.asset_tag}' already exists`);
          }
        }

        if (assetData.serial_no) {
          const { rows } = await client.query(
            'SELECT id FROM assets WHERE serial_no = $1',
            [assetData.serial_no]
          );
          if (rows.length > 0) {
            throw new Error(`Serial number '${assetData.serial_no}' already exists`);
          }
        }

        // Validate tracking mode
        if (assetData.tracking === 'individual' && assetData.quantity !== 1) {
          throw new Error('Individual tracked assets must have quantity of 1');
        }

        // Insert asset
        const { rows } = await client.query(
          `INSERT INTO assets (
            asset_tag, name, description, category_id, tracking, quantity, 
            low_stock_threshold, unit_cost, serial_no, brand_model, condition, 
            status, owner_org_id, home_berm_id, location_id, responsible_user_id,
            is_issuable, loan_days_override, purchase_id, warranty_until, is_institute_asset
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
          RETURNING *`,
          [
            assetData.asset_tag || null,
            assetData.name,
            assetData.description || null,
            assetData.category_id,
            assetData.tracking,
            assetData.quantity,
            assetData.low_stock_threshold,
            assetData.unit_cost || null,
            assetData.serial_no || null,
            assetData.brand_model || null,
            assetData.condition,
            assetData.status,
            assetData.owner_org_id || null,
            assetData.home_berm_id || null,
            assetData.location_id || null,
            assetData.responsible_user_id || null,
            assetData.is_issuable,
            assetData.loan_days_override || null,
            assetData.purchase_id || null,
            assetData.warranty_until || null,
            assetData.is_institute_asset
          ]
        );
        
        created.push(rows[0]);
      } catch (error) {
        errors.push({
          index: i,
          asset: assetData,
          error: error.message
        });
      }
    }

    if (errors.length > 0) {
      throw new AppError('BATCH_CREATE_FAILED', 'Some assets failed to create', 400, errors);
    }

    return created;
  });
}

export async function getById(id) {
  const asset = await repository.getById(id);
  if (!asset) {
    throw new AppError('ASSET_NOT_FOUND', 'Asset not found', 404);
  }
  return asset;
}

export async function list(filters) {
  const offset = (filters.page - 1) * filters.limit;
  
  const processedFilters = {
    ...filters,
    offset,
  };

  const result = await repository.list(processedFilters);
  
  return {
    items: result.items,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: result.total,
      pages: Math.ceil(result.total / filters.limit),
    },
  };
}

export async function update(id, data) {
  // Check if asset exists
  const existing = await repository.getById(id);
  if (!existing) {
    throw new AppError('ASSET_NOT_FOUND', 'Asset not found', 404);
  }

  // Validate unique constraints if updating
  if (data.asset_tag && data.asset_tag !== existing.asset_tag) {
    const tagExists = await repository.getByAssetTag(data.asset_tag);
    if (tagExists) {
      throw new AppError('ASSET_TAG_EXISTS', 'Asset with this asset tag already exists', 409);
    }
  }

  if (data.serial_no && data.serial_no !== existing.serial_no) {
    const serialExists = await repository.getBySerialNo(data.serial_no);
    if (serialExists) {
      throw new AppError('SERIAL_NO_EXISTS', 'Asset with this serial number already exists', 409);
    }
  }

  // Validate tracking mode and quantity
  const tracking = data.tracking || existing.tracking;
  const quantity = data.quantity !== undefined ? data.quantity : existing.quantity;
  
  if (tracking === 'individual' && quantity !== 1) {
    throw new AppError('INVALID_QUANTITY', 'Individual tracked assets must have quantity of 1', 400);
  }

  return repository.update(id, data);
}

export async function deleteById(id) {
  // Check if asset exists
  const existing = await repository.getById(id);
  if (!existing) {
    throw new AppError('ASSET_NOT_FOUND', 'Asset not found', 404);
  }

  // Check if asset has active issues
  const hasIssues = await repository.hasActiveIssues(id);
  if (hasIssues) {
    throw new AppError('ASSET_HAS_ACTIVE_ISSUES', 'Cannot delete asset with active issues', 400);
  }

  // Check if asset has active transfers
  const hasTransfers = await repository.hasActiveTransfers(id);
  if (hasTransfers) {
    throw new AppError('ASSET_HAS_ACTIVE_TRANSFERS', 'Cannot delete asset with active transfers', 400);
  }

  return repository.deleteById(id);
}

export async function generateQRToken(assetId) {
  // Verify asset exists
  const asset = await repository.getById(assetId);
  if (!asset) {
    throw new AppError('ASSET_NOT_FOUND', 'Asset not found', 404);
  }

  // Generate QR token
  const token = await qrService.generateToken('asset', assetId);
  
  return {
    asset_id: assetId,
    qr_token: token,
    asset_name: asset.name,
  };
}

export async function resolveQRToken(qrToken) {
  // Resolve token
  const resolved = await qrService.resolveToken(qrToken);
  
  if (!resolved || resolved.entity_type !== 'asset') {
    throw new AppError('INVALID_QR_TOKEN', 'Invalid or expired QR token', 404);
  }

  // Get asset details
  const asset = await repository.getById(resolved.entity_id);
  if (!asset) {
    throw new AppError('ASSET_NOT_FOUND', 'Asset not found', 404);
  }

  return asset;
}

export async function exportAssets(filters) {
  const assets = await repository.exportAssets(filters);
  
  if (filters.format === 'csv') {
    // Convert to CSV
    const records = assets.map(asset => ({
      'Asset Tag': asset.asset_tag || '',
      'Name': asset.name,
      'Description': asset.description || '',
      'Category': asset.category_name || '',
      'Tracking': asset.tracking,
      'Quantity': asset.quantity,
      'Low Stock Threshold': asset.low_stock_threshold,
      'Unit Cost': asset.unit_cost || '',
      'Serial Number': asset.serial_no || '',
      'Brand/Model': asset.brand_model || '',
      'Condition': asset.condition,
      'Status': asset.status,
      'Owner Organization': asset.owner_org_name || '',
      'Location': asset.location_name || '',
      'Responsible User': asset.responsible_user_name || '',
      'Is Issuable': asset.is_issuable ? 'Yes' : 'No',
      'Loan Days Override': asset.loan_days_override || '',
      'Warranty Until': asset.warranty_until || '',
      'Is Institute Asset': asset.is_institute_asset ? 'Yes' : 'No',
      'Created At': asset.created_at,
      'Updated At': asset.updated_at,
    }));

    const csv = stringify(records, {
      header: true,
      quoted: true,
    });

    return csv;
  }

  // Return JSON
  return assets;
}
