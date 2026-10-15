// src/modules/borrower-blocks/borrower-blocks.repository.js
import { pool } from '../../db/pool.js';

export async function createBorrowerBlock(blockData) {
  const { rows } = await pool.query(
    `INSERT INTO borrower_blocks (user_id, issue_id, reason, blocked_by, blocked_until, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      blockData.user_id,
      blockData.issue_id || null,
      blockData.reason,
      blockData.blocked_by,
      blockData.blocked_until || null,
      blockData.is_active !== undefined ? blockData.is_active : true,
    ]
  );
  return rows[0];
}

export async function listBorrowerBlocks({ filters = {} }) {
  const values = [];
  const conditions = [];
  let paramCount = 0;

  if (filters.user_id) {
    paramCount++;
    values.push(filters.user_id);
    conditions.push(`bb.user_id = $${paramCount}`);
  }

  if (filters.is_active !== undefined) {
    paramCount++;
    values.push(filters.is_active);
    conditions.push(`bb.is_active = $${paramCount}`);
  }

  if (filters.blocked_until) {
    paramCount++;
    values.push(filters.blocked_until);
    conditions.push(`bb.blocked_until = $${paramCount}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count total
  const countQuery = `SELECT COUNT(*)::int as total FROM borrower_blocks bb ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = countResult.rows[0].total;

  // Fetch data with user info
  paramCount++;
  values.push(20); // default limit
  paramCount++;
  values.push(0); // offset

  const dataQuery = `
    SELECT 
      bb.*,
      u.full_name as blocked_by_name,
      u2.full_name as user_name
    FROM borrower_blocks bb
    JOIN users u ON bb.blocked_by = u.id
    LEFT JOIN users u2 ON bb.user_id = u2.id
    ${whereClause}
    ORDER BY bb.created_at DESC
    LIMIT $${paramCount - 1} OFFSET $${paramCount}
  `;

  const { rows } = await pool.query(dataQuery, values);
  return { rows, total };
}

export async function getActiveBlocksForUser(userId) {
  const { rows } = await pool.query(
    `SELECT 
      bb.*,
      u.full_name as blocked_by_name,
      u2.full_name as user_name
     FROM borrower_blocks bb
     JOIN users u ON bb.blocked_by = u.id
     LEFT JOIN users u2 ON bb.user_id = u2.id
     WHERE bb.user_id = $1
       AND bb.is_active = true
       AND (bb.blocked_until IS NULL OR bb.blocked_until > NOW())
     ORDER BY bb.created_at DESC`,
    [userId]
  );
  return rows;
}

export async function getBlockById(id) {
  const { rows } = await pool.query(
    `SELECT 
      bb.*,
      u.full_name as blocked_by_name,
      u2.full_name as user_name
     FROM borrower_blocks bb
     JOIN users u ON bb.blocked_by = u.id
     LEFT JOIN users u2 ON bb.user_id = u2.id
     WHERE bb.id = $1`,
    [id]
  );
  return rows[0];
}

export async function updateBorrowerBlock(id, fields) {
  const allowed = ['reason', 'blocked_until', 'is_active', 'lifted_by', 'lifted_at'];
  const entries = Object.entries(fields).filter(([key]) => allowed.includes(key));
  if (!entries.length) return getBlockById(id);

  const values = entries.map(([, value]) => value);
  const assignments = entries.map(([key], index) => `${key} = $${index + 1}`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE borrower_blocks 
     SET ${assignments.join(', ')}, updated_at = now() 
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );
  return rows[0];
}

export async function deleteBorrowerBlock(id) {
  const { rows } = await pool.query(
    'DELETE FROM borrower_blocks WHERE id = $1 RETURNING id',
    [id]
  );
  return rows[0];
}