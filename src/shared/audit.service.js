import { pool } from '../db/pool.js';

export async function logIssueAction(action, issueId, actorId, data = {}, client = pool) {
  const { rows } = await client.query(
    `INSERT INTO audit_log (table_name, record_id, action, changed_by, new_data)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    ['issues', issueId, action, actorId || null, JSON.stringify(redactSensitiveData(data))]
  );

  return rows[0];
}

/**
 * Create an audit log entry
 * @param {Object} data - Audit log data
 * @param {string} data.table_name - Name of the table being modified
 * @param {string} data.record_id - UUID of the record being modified
 * @param {string} data.action - Action performed (create, update, delete)
 * @param {string} data.changed_by - UUID of the user performing the action
 * @param {Object} data.old_data - Previous state of the record (for updates/deletes)
 * @param {Object} data.new_data - New state of the record (for creates/updates)
 * @param {string} data.request_id - Optional request correlation ID
 * @param {string} data.ip_address - Optional IP address of the requester
 * @param {string} data.user_agent - Optional user agent string
 * @returns {Promise<Object>} Created audit log entry
 */
export async function createAuditLog(data) {
  // Redact sensitive fields
  const sanitizedOldData = redactSensitiveData(data.old_data);
  const sanitizedNewData = redactSensitiveData(data.new_data);

  const { rows } = await pool.query(
    `INSERT INTO audit_log (
      table_name, record_id, action, changed_by, old_data, new_data, 
      request_id, ip_address, user_agent
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      data.table_name,
      data.record_id,
      data.action,
      data.changed_by || null,
      sanitizedOldData ? JSON.stringify(sanitizedOldData) : null,
      sanitizedNewData ? JSON.stringify(sanitizedNewData) : null,
      data.request_id || null,
      data.ip_address || null,
      data.user_agent || null,
    ]
  );

  return rows[0];
}

/**
 * Create an audit log entry within an existing transaction
 * @param {Object} client - PostgreSQL client from a transaction
 * @param {Object} data - Audit log data (same as createAuditLog)
 * @returns {Promise<Object>} Created audit log entry
 */
export async function createAuditLogInTransaction(client, data) {
  const sanitizedOldData = redactSensitiveData(data.old_data);
  const sanitizedNewData = redactSensitiveData(data.new_data);

  const { rows } = await client.query(
    `INSERT INTO audit_log (
      table_name, record_id, action, changed_by, old_data, new_data, 
      request_id, ip_address, user_agent
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      data.table_name,
      data.record_id,
      data.action,
      data.changed_by || null,
      sanitizedOldData ? JSON.stringify(sanitizedOldData) : null,
      sanitizedNewData ? JSON.stringify(sanitizedNewData) : null,
      data.request_id || null,
      data.ip_address || null,
      data.user_agent || null,
    ]
  );

  return rows[0];
}

/**
 * Redact sensitive data from audit log entries
 * @param {Object} data - Data to redact
 * @returns {Object} Redacted data
 */
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
    'private_key',
  ];

  const redacted = { ...data };

  for (const field of sensitiveFields) {
    if (field in redacted) {
      redacted[field] = '[REDACTED]';
    }
  }

  return redacted;
}

/**
 * Helper to extract request metadata for audit logging
 * @param {Object} req - Express request object
 * @returns {Object} Request metadata
 */
export function extractRequestMetadata(req) {
  return {
    request_id: req.id || null,
    ip_address: req.ip || req.connection?.remoteAddress || null,
    user_agent: req.get('user-agent') || null,
  };
}
