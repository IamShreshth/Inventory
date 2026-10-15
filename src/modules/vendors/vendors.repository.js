import { pool } from '../../db/pool.js';

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO vendors (name, code, contact_person, email, phone, address, city, state, country, pincode, gstin, pan, website, notes, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING *`,
    [
      data.name,
      data.code,
      data.contact_person || null,
      data.email || null,
      data.phone || null,
      data.address || null,
      data.city || null,
      data.state || null,
      data.country || null,
      data.pincode || null,
      data.gstin || null,
      data.pan || null,
      data.website || null,
      data.notes || null,
      data.is_active
    ]
  );
  return rows[0];
}

export async function getById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM vendors WHERE id = $1`,
    [id]
  );
  return rows[0];
}

export async function list(filters = {}) {
  const conditions = [];
  const values = [];
  let paramCount = 0;

  if (filters.is_active !== undefined) {
    paramCount++;
    conditions.push(`is_active = $${paramCount}`);
    values.push(filters.is_active);
  }

  if (filters.search) {
    paramCount++;
    conditions.push(`(name ILIKE $${paramCount} OR code ILIKE $${paramCount} OR contact_person ILIKE $${paramCount})`);
    values.push(`%${filters.search}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT *,
            COUNT(*) OVER() as total_count
     FROM vendors
     ${whereClause}
     ORDER BY name ASC
     LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
    [...values, filters.limit, filters.offset]
  );

  return {
    items: rows,
    total: rows.length > 0 ? parseInt(rows[0].total_count) : 0,
  };
}

export async function update(id, fields) {
  const allowed = ['name', 'code', 'contact_person', 'email', 'phone', 'address', 'city', 'state', 'country', 'pincode', 'gstin', 'pan', 'website', 'notes', 'is_active'];
  const entries = Object.entries(fields).filter(([key]) => allowed.includes(key));
  
  if (entries.length === 0) {
    return getById(id);
  }

  const values = entries.map(([, value]) => value);
  const assignments = entries.map(([key], index) => `${key} = $${index + 1}`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE vendors 
     SET ${assignments.join(', ')}, updated_at = now() 
     WHERE id = $${values.length} 
     RETURNING *`,
    values
  );

  return rows[0];
}

export async function deleteById(id) {
  const { rows } = await pool.query(
    'DELETE FROM vendors WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0];
}

export async function getByCode(code) {
  const { rows } = await pool.query(
    'SELECT * FROM vendors WHERE code = $1',
    [code]
  );
  return rows[0];
}

export async function hasPurchases(vendorId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*) as count FROM purchases WHERE vendor_id = $1',
    [vendorId]
  );
  return parseInt(rows[0].count) > 0;
}
