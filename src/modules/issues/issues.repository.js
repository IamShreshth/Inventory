// src/modules/issues/issues.repository.js
import { pool } from '../../db/pool.js';

export async function createIssue(issueData) {
  const { rows } = await pool.query(
    `INSERT INTO issues (
      asset_id, quantity, borrower_id, on_behalf_of_org, purpose, status, requested_at, due_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      issueData.asset_id,
      issueData.quantity,
      issueData.borrower_id,
      issueData.on_behalf_of_org || null,
      issueData.purpose || null,
      'requested',
      new Date(),
      issueData.due_at,
    ]
  );
  return rows[0];
}

export async function listIssues({ limit, offset, filters = {} }) {
  const values = [];
  const conditions = [];
  let paramCount = 0;

  if (filters.status) {
    paramCount++;
    values.push(filters.status);
    conditions.push(`i.status = $${paramCount}`);
  }

  if (filters.borrower_id) {
    paramCount++;
    values.push(filters.borrower_id);
    conditions.push(`i.borrower_id = $${paramCount}`);
  }

  if (filters.asset_id) {
    paramCount++;
    values.push(filters.asset_id);
    conditions.push(`i.asset_id = $${paramCount}`);
  }

  if (filters.org_unit_ids) {
    paramCount++;
    values.push(filters.org_unit_ids);
    conditions.push(`EXISTS (
      SELECT 1 FROM assets scoped_asset
      WHERE scoped_asset.id = i.asset_id
        AND scoped_asset.owner_org_id = ANY($${paramCount}::uuid[])
    )`);
  }

  if (filters.overdue === 'true') {
    conditions.push(`i.due_at < NOW() AND i.status IN ('active', 'dropped')`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count total
  const countQuery = `SELECT COUNT(*)::int as total FROM issues i ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = countResult.rows[0].total;

  // Fetch data with joins
  paramCount++;
  values.push(limit);
  paramCount++;
  values.push(offset);

  const dataQuery = `
    SELECT 
      i.*,
      u.full_name as borrower_name,
      u.institute_email as borrower_email,
      a.name as asset_name,
      a.asset_tag,
      c.name as category_name,
      iu.full_name as issued_by_name,
      ru.full_name as received_by_name,
      o.name as org_name
    FROM issues i
    JOIN users u ON i.borrower_id = u.id
    JOIN assets a ON i.asset_id = a.id
    JOIN categories c ON a.category_id = c.id
    LEFT JOIN users iu ON i.issued_by = iu.id
    LEFT JOIN users ru ON i.received_by = ru.id
    LEFT JOIN org_units o ON i.on_behalf_of_org = o.id
    ${whereClause}
    ORDER BY i.created_at DESC
    LIMIT $${paramCount - 1} OFFSET $${paramCount}
  `;

  const { rows } = await pool.query(dataQuery, values);
  return { rows, total };
}

export async function getIssueById(id) {
  const { rows } = await pool.query(
    `SELECT 
      i.*,
      u.full_name as borrower_name,
      u.institute_email as borrower_email,
      a.name as asset_name,
      a.asset_tag,
      a.tracking,
      c.name as category_name,
      c.default_loan_days,
      c.max_renewals,
      iu.full_name as issued_by_name,
      ru.full_name as received_by_name,
      o.name as org_name,
      db.name as drop_box_name
    FROM issues i
    JOIN users u ON i.borrower_id = u.id
    JOIN assets a ON i.asset_id = a.id
    JOIN categories c ON a.category_id = c.id
    LEFT JOIN users iu ON i.issued_by = iu.id
    LEFT JOIN users ru ON i.received_by = ru.id
    LEFT JOIN org_units o ON i.on_behalf_of_org = o.id
    LEFT JOIN drop_boxes db ON i.drop_box_id = db.id
    WHERE i.id = $1`,
    [id]
  );
  return rows[0];
}

export async function updateIssue(id, fields) {
  const allowed = ['quantity', 'purpose', 'on_behalf_of_org', 'status', 'issued_at', 'issued_by', 'due_at', 'dropped_at', 'drop_box_id', 'returned_at', 'received_by', 'return_condition', 'remarks', 'cancellation_reason', 'renewal_count'];
  const entries = Object.entries(fields).filter(([key]) => allowed.includes(key));
  if (!entries.length) return getIssueById(id);

  const values = entries.map(([, value]) => value);
  const assignments = entries.map(([key], index) => `${key} = $${index + 1}`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE issues 
     SET ${assignments.join(', ')}, updated_at = NOW() 
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );
  return rows[0];
}

export async function deleteIssue(id) {
  const { rows } = await pool.query(
    'DELETE FROM issues WHERE id = $1 RETURNING id',
    [id]
  );
  return rows[0];
}

export async function getOverdueIssues(borrowerId = null, orgUnitIds = null) {
  const { rows } = await pool.query(
    `SELECT 
      i.*,
      u.full_name as borrower_name,
      u.institute_email as borrower_email,
      a.name as asset_name,
      a.asset_tag
    FROM issues i
    JOIN users u ON i.borrower_id = u.id
    JOIN assets a ON i.asset_id = a.id
    WHERE i.due_at < NOW() 
      AND i.status IN ('active', 'dropped')
      AND ($1::uuid IS NULL OR i.borrower_id = $1)
      AND ($2::uuid[] IS NULL OR a.owner_org_id = ANY($2::uuid[]))
    ORDER BY i.due_at ASC`
    , [borrowerId, orgUnitIds]
  );
  return rows;
}

export async function getDroppedIssues(orgUnitIds = null) {
  const { rows } = await pool.query(
    `SELECT 
      i.*,
      u.full_name as borrower_name,
      u.institute_email as borrower_email,
      a.name as asset_name,
      db.name as drop_box_name,
      l.name as location_name
    FROM issues i
    JOIN users u ON i.borrower_id = u.id
    JOIN assets a ON i.asset_id = a.id
    LEFT JOIN drop_boxes db ON i.drop_box_id = db.id
    LEFT JOIN locations l ON db.location_id = l.id
    WHERE i.status = 'dropped' AND i.returned_at IS NULL
      AND ($1::uuid[] IS NULL OR a.owner_org_id = ANY($1::uuid[]))
    ORDER BY i.dropped_at ASC`,
    [orgUnitIds]
  );
  return rows;
}

export async function checkBorrowerBlocks(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM borrower_blocks 
     WHERE user_id = $1 
       AND is_active = true
       AND (blocked_until IS NULL OR blocked_until > NOW())
     LIMIT 1`,
    [userId]
  );
  return rows[0];
}
