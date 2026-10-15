import * as repository from './audit-log.repository.js';
import { AppError } from '../../shared/app-error.js';

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

export async function getById(id) {
  const log = await repository.getById(id);
  if (!log) {
    throw new AppError('AUDIT_LOG_NOT_FOUND', 'Audit log entry not found', 404);
  }
  return log;
}

export async function getByEntity(entityType, entityId) {
  return repository.getByEntity(entityType, entityId);
}

export async function logChange(data) {
  // Redact sensitive fields from old_data and new_data
  const sanitizedOldData = redactSensitiveData(data.old_data);
  const sanitizedNewData = redactSensitiveData(data.new_data);

  return repository.create({
    ...data,
    old_data: sanitizedOldData,
    new_data: sanitizedNewData,
  });
}

function redactSensitiveData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'password',
    'password_hash',
    'token',
    'access_token',
    'refresh_token',
    'reset_token',
    'qr_token',
    'token_hash',
    'secret',
    'api_key',
  ];

  const redacted = { ...data };

  for (const field of sensitiveFields) {
    if (field in redacted) {
      redacted[field] = '[REDACTED]';
    }
  }

  return redacted;
}
