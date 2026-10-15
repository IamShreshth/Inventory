import { pool } from '../../db/pool.js';

export async function list(filters = {}) {
  const conditions = [];
  const values = [];
  let paramCount = 0;

  // Table name filter
  if (filters.table_name) {
    paramCount++;
    conditions.push(`table_name = $${paramCount}`);
    values.push(filters.table_name);
  }

  // Record ID filter
  if (filters.record_id) {
    paramCount++;
    conditions.push(`record_id = $${paramCount}`);
    values.push(filters.record_id);
  }

  // Action filter
  if (filters.action) {
    paramCount++;
    conditions.push(`action = $${paramCount}`);
    values.push(filters.action);
  }

  // Changed by filter
  if (filters.changed_by) {
    paramCount++;
    conditions.push(`changed_by = $${paramCount}`);
    values.push(filters.changed_by);
  }

  // Date range filters
  if (filters.from_date) {
    paramCount++;
    conditions.push(`al.created_at >= $${paramCount}::date`);
    values.push(filters.from_date);
  }

  if (filters.to_date) {
    paramCount++;
    conditions.push(`al.created_at < ($${paramCount}::date + interval '1 day')`);
    values.push(filters.to_date);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT al.*,
            al.created_at as changed_at,
            u.full_name as changed_by_name,
            COUNT(*) OVER() as total_count
     FROM audit_log al
     LEFT JOIN users u ON al.changed_by = u.id
     ${whereClause}
     ORDER BY al.created_at DESC
     LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
    [...values, filters.limit, filters.offset]
  );

  return {
    items: rows,
    total: rows.length > 0 ? parseInt(rows[0].total_count) : 0,
  };
}

export async function getById(id) {
  const { rows } = await pool.query(
    `SELECT al.*,
            u.full_name as changed_by_name
     FROM audit_log al
     LEFT JOIN users u ON al.changed_by = u.id
     WHERE al.id = $1`,
    [id]
  );
  return rows[0];
}

export async function getByEntity(entityType, entityId) {
  const { rows } = await pool.query(
    `SELECT al.*,
            al.created_at as changed_at,
            u.full_name as changed_by_name
     FROM audit_log al
     LEFT JOIN users u ON al.changed_by = u.id
     WHERE al.table_name = $1 AND al.record_id = $2
     ORDER BY al.created_at DESC`,
    [entityType, entityId]
  );
  return rows;
}

export async function create(data) {
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
      data.old_data || null,
      data.new_data || null,
      data.request_id || null,
      data.ip_address || null,
      data.user_agent || null,
    ]
  );
  return rows[0];
}
