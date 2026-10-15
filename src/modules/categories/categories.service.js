import * as repository from './categories.repository.js';
import { AppError } from '../../shared/app-error.js';

export async function create(data) {
  // Check if name already exists
  const existing = await repository.getByName(data.name);
  if (existing) {
    throw new AppError('CATEGORY_NAME_EXISTS', 'Category with this name already exists', 409);
  }

  // Validate parent exists if provided
  if (data.parent_id) {
    const parent = await repository.getById(data.parent_id);
    if (!parent) {
      throw new AppError('PARENT_NOT_FOUND', 'Parent category not found', 404);
    }
  }

  return repository.create(data);
}

export async function getById(id) {
  const category = await repository.getById(id);
  if (!category) {
    throw new AppError('CATEGORY_NOT_FOUND', 'Category not found', 404);
  }
  return category;
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
  // Check if category exists
  const existing = await repository.getById(id);
  if (!existing) {
    throw new AppError('CATEGORY_NOT_FOUND', 'Category not found', 404);
  }

  // Check name uniqueness if updating name
  if (data.name && data.name.toLowerCase() !== existing.name.toLowerCase()) {
    const nameExists = await repository.getByName(data.name);
    if (nameExists) {
      throw new AppError('CATEGORY_NAME_EXISTS', 'Category with this name already exists', 409);
    }
  }

  // Validate parent exists if updating
  if (data.parent_id) {
    // Prevent setting self as parent
    if (data.parent_id === id) {
      throw new AppError('INVALID_PARENT', 'Category cannot be its own parent', 400);
    }

    const parent = await repository.getById(data.parent_id);
    if (!parent) {
      throw new AppError('PARENT_NOT_FOUND', 'Parent category not found', 404);
    }
  }

  return repository.update(id, data);
}

export async function deleteById(id) {
  // Check if category exists
  const existing = await repository.getById(id);
  if (!existing) {
    throw new AppError('CATEGORY_NOT_FOUND', 'Category not found', 404);
  }

  // Check if it has children
  const children = await repository.getChildren(id);
  if (children.length > 0) {
    throw new AppError('CATEGORY_HAS_CHILDREN', 'Cannot delete category with subcategories', 400);
  }

  // Check if it has assets
  const hasAssets = await repository.hasAssets(id);
  if (hasAssets) {
    throw new AppError('CATEGORY_HAS_ASSETS', 'Cannot delete category with assets', 400);
  }

  return repository.deleteById(id);
}

export async function getChildren(parentId) {
  // Validate parent exists
  const parent = await repository.getById(parentId);
  if (!parent) {
    throw new AppError('CATEGORY_NOT_FOUND', 'Category not found', 404);
  }

  return repository.getChildren(parentId);
}
