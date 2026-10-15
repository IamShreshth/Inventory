import * as repository from './vendors.repository.js';
import { AppError } from '../../shared/app-error.js';

export async function create(data) {
  // Check if code already exists
  const existing = await repository.getByCode(data.code);
  if (existing) {
    throw new AppError('VENDOR_CODE_EXISTS', 'Vendor with this code already exists', 409);
  }

  return repository.create(data);
}

export async function getById(id) {
  const vendor = await repository.getById(id);
  if (!vendor) {
    throw new AppError('VENDOR_NOT_FOUND', 'Vendor not found', 404);
  }
  return vendor;
}

export async function list(filters) {
  const offset = (filters.page - 1) * filters.limit;
  
  const processedFilters = {
    ...filters,
    is_active: filters.is_active === 'true' ? true : filters.is_active === 'false' ? false : undefined,
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
  // Check if vendor exists
  const existing = await repository.getById(id);
  if (!existing) {
    throw new AppError('VENDOR_NOT_FOUND', 'Vendor not found', 404);
  }

  // Check code uniqueness if updating code
  if (data.code && data.code !== existing.code) {
    const codeExists = await repository.getByCode(data.code);
    if (codeExists) {
      throw new AppError('VENDOR_CODE_EXISTS', 'Vendor with this code already exists', 409);
    }
  }

  return repository.update(id, data);
}

export async function deleteById(id) {
  // Check if vendor exists
  const existing = await repository.getById(id);
  if (!existing) {
    throw new AppError('VENDOR_NOT_FOUND', 'Vendor not found', 404);
  }

  // Check if vendor has purchases
  const hasPurchases = await repository.hasPurchases(id);
  if (hasPurchases) {
    throw new AppError('VENDOR_HAS_PURCHASES', 'Cannot delete vendor with purchase records', 400);
  }

  return repository.deleteById(id);
}
