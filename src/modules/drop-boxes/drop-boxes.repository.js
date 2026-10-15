// src/modules/drop-boxes/drop-boxes.repository.js
import { pool } from '../../db/pool.js';

export async function createDropBox(dropBoxData) {
  const { rows } = await pool.query(
    `INSERT INTO drop_boxes (name, location_id, org_unit_id, qr_token_hash, description, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      dropBoxData.name,
      dropBoxData.location_id,
      dropBoxData.org_unit_id || null,
      dropBoxData.qr_token_hash || null,
      dropBoxData.description || null,
      dropBoxData.is_active !== undefined ? dropBoxData.is_active : true,
    ]
  );
  return rows[0];
}

export async function listDropBoxes({ filters = {} }) {
  const values = [];
  const conditions = [];
  let paramCount = 0;

  if (filters.location_id) {
    paramCount++;
    values.push(filters.location_id);
    conditions.push(`db.location_id = $${paramCount}`);
  }

  if (filters.org_unit_id) {
    paramCount++;
    values.push(filters.org_unit_id);
    conditions.push(`db.org_unit_id = $${paramCount}`);
  }

  if (filters.is_active !== undefined) {
    paramCount++;
    values.push(filters.is_active);
    conditions.push(`db.is_active = $${paramCount}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count total
  const countQuery = `SELECT COUNT(*)::int as total FROM drop_boxes db ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = countResult.rows[0].total;

  // Fetch data
  paramCount++;
  values.push(20); // default limit
  paramCount++;
  values.push(0); // offset

  const dataQuery = `
    SELECT 
      db.*,
      l.name as location_name,
      o.name as org_name
    FROM drop_boxes db
    LEFT JOIN locations l ON db.location_id = l.id
    LEFT JOIN org_units o ON db.org_unit_id = o.id
    ${whereClause}
    ORDER BY db.created_at DESC
    LIMIT $${paramCount - 1} OFFSET $${paramCount}
  `;

  const { rows } = await pool.query(dataQuery, values);
  return { rows, total };
}

export async function getDropBoxById(id) {
  const { rows } = await pool.query(
    `SELECT 
      db.*,
      l.name as location_name,
      o.name as org_name
     FROM drop_boxes db
     LEFT JOIN locations l ON db.location_id = l.id
     LEFT JOIN org_units o ON db.org_unit_id = o.id
     WHERE db.id = $1`,
    [id]
  );
  return rows[0];
}

export async function updateDropBox(id, fields) {
  const allowed = ['name', 'location_id', 'org_unit_id', 'qr_token_hash', 'description', 'is_active'];
  const entries = Object.entries(fields).filter(([key]) => allowed.includes(key));
  if (!entries.length) return getDropBoxById(id);

  const values = entries.map(([, value]) => value);
  const assignments = entries.map(([key], index) => `${key} = $${index + 1}`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE drop_boxes 
     SET ${assignments.join(', ')}, updated_at = now() 
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );
  return rows[0];
}

export async function deleteDropBox(id) {
  const { rows } = await pool.query(
    'DELETE FROM drop_boxes WHERE id = $1 RETURNING id',
    [id]
  );
  return rows[0];
}