// src/modules/alerts/alerts.repository.js
import { pool } from '../../db/pool.js';

/**
 * Find alerts with filters and pagination
 */
export async function findAlerts({ filters, limit, offset, sort = 'created_at DESC' }) {
  const conditions = [];
  const params = [];
  let paramCount = 1;

  if (filters.type) {
    conditions.push(`type = $${paramCount++}`);
    params.push(filters.type);
  }

  if (filters.status) {
    conditions.push(`status = $${paramCount++}`);
    params.push(filters.status);
  }

  if (filters.severity) {
    conditions.push(`severity = $${paramCount++}`);
    params.push(filters.severity);
  }

  if (filters.asset_id) {
    conditions.push(`asset_id = $${paramCount++}`);
    params.push(filters.asset_id);
  }

  if (filters.issue_id) {
    conditions.push(`issue_id = $${paramCount++}`);
    params.push(filters.issue_id);
  }

  if (filters.org_unit_id) {
    conditions.push(`org_unit_id = $${paramCount++}`);
    params.push(filters.org_unit_id);
  }

  if (filters.entity_type) {
    conditions.push(`entity_type = $${paramCount++}`);
    params.push(filters.entity_type);
  }

  if (filters.entity_id) {
    conditions.push(`entity_id = $${paramCount++}`);
    params.push(filters.entity_id);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `SELECT COUNT(*) FROM alerts ${whereClause}`;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count, 10);

  // Get data with pagination
  const dataQuery = `
    SELECT 
      a.*,
      u1.full_name as acknowledged_by_name,
      u2.full_name as resolved_by_name
    FROM alerts a
    LEFT JOIN users u1 ON a.acknowledged_by = u1.id
    LEFT JOIN users u2 ON a.resolved_by = u2.id
    ${whereClause}
    ORDER BY ${sort}
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;
  
  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

  return {
    rows: dataResult.rows,
    total,
  };
}

/**
 * Find alert by ID
 */
export async function findAlertById(id) {
  const query = `
    SELECT 
      a.*,
      u1.full_name as acknowledged_by_name,
      u2.full_name as resolved_by_name
    FROM alerts a
    LEFT JOIN users u1 ON a.acknowledged_by = u1.id
    LEFT JOIN users u2 ON a.resolved_by = u2.id
    WHERE a.id = $1
  `;
  
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

/**
 * Create a new alert
 */
export async function createAlert(alertData) {
  const {
    type,
    severity = 'medium',
    title,
    message,
    entity_type,
    entity_id,
    asset_id,
    issue_id,
    org_unit_id,
    metadata = {},
  } = alertData;

  const query = `
    INSERT INTO alerts (
      type, severity, title, message, 
      entity_type, entity_id, 
      asset_id, issue_id, org_unit_id, 
      metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const params = [
    type,
    severity,
    title,
    message,
    entity_type,
    entity_id,
    asset_id,
    issue_id,
    org_unit_id,
    JSON.stringify(metadata),
  ];

  const result = await pool.query(query, params);
  return result.rows[0];
}

/**
 * Update alert
 */
export async function updateAlert(id, updateData) {
  const fields = [];
  const params = [];
  let paramCount = 1;

  if (updateData.title !== undefined) {
    fields.push(`title = $${paramCount++}`);
    params.push(updateData.title);
  }

  if (updateData.message !== undefined) {
    fields.push(`message = $${paramCount++}`);
    params.push(updateData.message);
  }

  if (updateData.severity !== undefined) {
    fields.push(`severity = $${paramCount++}`);
    params.push(updateData.severity);
  }

  if (updateData.status !== undefined) {
    fields.push(`status = $${paramCount++}`);
    params.push(updateData.status);
  }

  if (updateData.metadata !== undefined) {
    fields.push(`metadata = $${paramCount++}`);
    params.push(JSON.stringify(updateData.metadata));
  }

  if (fields.length === 0) {
    return findAlertById(id);
  }

  fields.push(`updated_at = now()`);
  params.push(id);

  const query = `
    UPDATE alerts
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, params);
  return result.rows[0] || null;
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(id, userId) {
  const query = `
    UPDATE alerts
    SET 
      status = 'acknowledged',
      acknowledged_by = $1,
      acknowledged_at = now(),
      updated_at = now()
    WHERE id = $2 AND status = 'open'
    RETURNING *
  `;

  const result = await pool.query(query, [userId, id]);
  return result.rows[0] || null;
}

/**
 * Resolve an alert
 */
export async function resolveAlert(id, userId, resolutionNotes) {
  const query = `
    UPDATE alerts
    SET 
      status = 'resolved',
      resolved_by = $1,
      resolved_at = now(),
      resolution_notes = $2,
      updated_at = now()
    WHERE id = $3 AND status IN ('open', 'acknowledged')
    RETURNING *
  `;

  const result = await pool.query(query, [userId, resolutionNotes, id]);
  return result.rows[0] || null;
}

/**
 * Dismiss an alert
 */
export async function dismissAlert(id) {
  const query = `
    UPDATE alerts
    SET 
      status = 'dismissed',
      updated_at = now()
    WHERE id = $1 AND status IN ('open', 'acknowledged')
    RETURNING *
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

/**
 * Check if a similar alert already exists (for deduplication)
 */
export async function findExistingAlert({ type, entity_type, entity_id, status = ['open', 'acknowledged'] }) {
  const query = `
    SELECT * FROM alerts
    WHERE type = $1 
      AND entity_type = $2 
      AND entity_id = $3
      AND status = ANY($4)
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const result = await pool.query(query, [type, entity_type, entity_id, status]);
  return result.rows[0] || null;
}

/**
 * Get alert summary/statistics
 */
export async function getAlertSummary(filters = {}) {
  const conditions = [];
  const params = [];
  let paramCount = 1;

  if (filters.org_unit_id) {
    conditions.push(`org_unit_id = $${paramCount++}`);
    params.push(filters.org_unit_id);
  }

  if (filters.date_from) {
    conditions.push(`created_at >= $${paramCount++}`);
    params.push(filters.date_from);
  }

  if (filters.date_to) {
    conditions.push(`created_at <= $${paramCount++}`);
    params.push(filters.date_to);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT
      COUNT(*) as total_alerts,
      COUNT(*) FILTER (WHERE status = 'open') as open_alerts,
      COUNT(*) FILTER (WHERE status = 'acknowledged') as acknowledged_alerts,
      COUNT(*) FILTER (WHERE status = 'resolved') as resolved_alerts,
      COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed_alerts,
      COUNT(*) FILTER (WHERE severity = 'critical') as critical_alerts,
      COUNT(*) FILTER (WHERE severity = 'high') as high_alerts,
      COUNT(*) FILTER (WHERE severity = 'medium') as medium_alerts,
      COUNT(*) FILTER (WHERE severity = 'low') as low_alerts,
      COUNT(*) FILTER (WHERE type = 'low_stock') as low_stock_alerts,
      COUNT(*) FILTER (WHERE type = 'overdue_loan') as overdue_loan_alerts,
      COUNT(*) FILTER (WHERE type = 'warranty_expiry') as warranty_expiry_alerts,
      COUNT(*) FILTER (WHERE type = 'maintenance_due') as maintenance_due_alerts
    FROM alerts
    ${whereClause}
  `;

  const result = await pool.query(query, params);
  return result.rows[0];
}

/**
 * Delete old resolved/dismissed alerts (cleanup)
 */
export async function deleteOldAlerts(daysOld = 90) {
  const query = `
    DELETE FROM alerts
    WHERE status IN ('resolved', 'dismissed')
      AND updated_at < now() - interval '${daysOld} days'
    RETURNING id
  `;

  const result = await pool.query(query);
  return result.rows.length;
}
