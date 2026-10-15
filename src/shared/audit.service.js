// src/shared/audit.service.js
import { pool } from '../db/pool.js';

/**
 * Log an audit entry
 * 
 * @param {Object} entry - Audit entry data
 * @param {string} entry.table_name - Name of the table being modified
 * @param {string} entry.record_id - ID of the record
 * @param {string} entry.action - Action performed (create, update, delete, etc.)
 * @param {string} entry.changed_by - User ID who made the change
 * @param {Object} entry.old_data - Previous state (for updates/deletes)
 * @param {Object} entry.new_data - New state (for creates/updates)
 * @param {Object} client - Optional database client (for transactions)
 */
export async function logAudit(entry, client = null) {
  const db = client || pool;
  
  const query = `
    INSERT INTO audit_log (
      table_name,
      record_id,
      action,
      changed_by,
      old_data,
      new_data,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING id
  `;
  
  const values = [
    entry.table_name,
    entry.record_id,
    entry.action,
    entry.changed_by,
    entry.old_data ? JSON.stringify(entry.old_data) : null,
    entry.new_data ? JSON.stringify(entry.new_data) : null,
  ];
  
  try {
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    // Log error but don't fail the main operation
    console.error('Audit logging failed:', error);
    return null;
  }
}

/**
 * Create audit entry for issue workflow actions
 */
export async function logIssueAction(action, issueId, userId, details = {}, client = null) {
  return logAudit({
    table_name: 'issues',
    record_id: issueId,
    action,
    changed_by: userId,
    new_data: details,
  }, client);
}

/**
 * Get audit history for a record
 */
export async function getAuditHistory(tableName, recordId) {
  const query = `
    SELECT 
      al.*,
      u.full_name as changed_by_name,
      u.institute_email as changed_by_email
    FROM audit_log al
    LEFT JOIN users u ON al.changed_by = u.id
    WHERE al.table_name = $1 AND al.record_id = $2
    ORDER BY al.created_at DESC
  `;
  
  const result = await pool.query(query, [tableName, recordId]);
  return result.rows;
}
