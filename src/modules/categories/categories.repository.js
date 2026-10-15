import { pool } from '../../db/pool.js';

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO categories (name, parent_id, default_low_stock_threshold, default_loan_days, max_renewals)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.name,
      data.parent_id || null,
      data.default_low_stock_threshold,
      data.default_loan_days,
      data.max_renewals
    ]
  );
  return rows[0];
}

export async function getById(id) {
  const { rows } = await pool.query(
    `SELECT c.*, 
            parent.name as parent_name
     FROM categories c
     LEFT JOIN categories parent ON c.parent_id = parent.id
     WHERE c.id = $1`,
    [id]
  );
  return rows[0];
}

export async function list(filters = {}) {
  const conditions = [];
  const values = [];
  let paramCount = 0;

  if (filters.parent_id !== undefined) {
    if (filters.parent_id === null) {
      conditions.push(`c.parent_id IS NULL`);
    } else {
      paramCount++;
      conditions.push(`c.parent_id = $${paramCount}`);
      values.push(filters.parent_id);
    }
  }

  if (filters.search) {
    paramCount++;
    conditions.push(`c.name ILIKE $${paramCount}`);
    values.push(`%${filters.search}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT c.*,
            parent.name as parent_name,
            COUNT(*) OVER() as total_count
     FROM categories c
     LEFT JOIN categories parent ON c.parent_id = parent.id
     ${whereClause}
     ORDER BY c.name ASC
     LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
    [...values, filters.limit, filters.offset]
  );

  return {
    items: rows,
    total: rows.length > 0 ? parseInt(rows[0].total_count) : 0,
  };
}

export async function update(id, fields) {
  const allowed = ['name', 'parent_id', 'default_low_stock_threshold', 'default_loan_days', 'max_renewals'];
  const entries = Object.entries(fields).filter(([key]) => allowed.includes(key));
  
  if (entries.length === 0) {
    return getById(id);
  }

  const values = entries.map(([, value]) => value);
  const assignments = entries.map(([key], index) => `${key} = $${index + 1}`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE categories 
     SET ${assignments.join(', ')}, updated_at = now() 
     WHERE id = $${values.length} 
     RETURNING *`,
    values
  );

  return rows[0];
}

export async function deleteById(id) {
  const { rows } = await pool.query(
    'DELETE FROM categories WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0];
}

export async function getChildren(parentId) {
  const { rows } = await pool.query(
    `SELECT * FROM categories WHERE parent_id = $1 ORDER BY name`,
    [parentId]
  );
  return rows;
}

export async function getByName(name) {
  const { rows } = await pool.query(
    'SELECT * FROM categories WHERE LOWER(name) = LOWER($1)',
    [name]
  );
  return rows[0];
}

export async function hasAssets(categoryId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*) as count FROM assets WHERE category_id = $1',
    [categoryId]
  );
  return parseInt(rows[0].count) > 0;
}
