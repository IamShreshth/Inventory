import * as repository from './locations.repository.js';
import { AppError } from '../../shared/app-error.js';

export async function create(data) {
  // Validate parent exists if provided
  if (data.parent_location_id) {
    const parent = await repository.getById(data.parent_location_id);
    if (!parent) {
      throw new AppError('PARENT_NOT_FOUND', 'Parent location not found', 404);
    }
  }

  return repository.create(data);
}

export async function getById(id) {
  const location = await repository.getById(id);
  if (!location) {
    throw new AppError('LOCATION_NOT_FOUND', 'Location not found', 404);
  }
  return location;
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
  // Check if location exists
  const existing = await repository.getById(id);
  if (!existing) {
    throw new AppError('LOCATION_NOT_FOUND', 'Location not found', 404);
  }

  // Validate parent exists if updating
  if (data.parent_location_id) {
    // Prevent setting self as parent
    if (data.parent_location_id === id) {
      throw new AppError('INVALID_PARENT', 'Location cannot be its own parent', 400);
    }

    const parent = await repository.getById(data.parent_location_id);
    if (!parent) {
      throw new AppError('PARENT_NOT_FOUND', 'Parent location not found', 404);
    }
  }

  return repository.update(id, data);
}

export async function deleteById(id) {
  // Check if location exists
  const existing = await repository.getById(id);
  if (!existing) {
    throw new AppError('LOCATION_NOT_FOUND', 'Location not found', 404);
  }

  // Check if it has children
  const children = await repository.getChildren(id);
  if (children.length > 0) {
    throw new AppError('LOCATION_HAS_CHILDREN', 'Cannot delete location with sub-locations', 400);
  }

  // Check if it has assets
  const hasAssets = await repository.hasAssets(id);
  if (hasAssets) {
    throw new AppError('LOCATION_HAS_ASSETS', 'Cannot delete location with assets', 400);
  }

  return repository.deleteById(id);
}

export async function getChildren(parentId) {
  // Validate parent exists
  const parent = await repository.getById(parentId);
  if (!parent) {
    throw new AppError('LOCATION_NOT_FOUND', 'Location not found', 404);
  }

  return repository.getChildren(parentId);
}
