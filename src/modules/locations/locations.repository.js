import { pool } from '../../db/pool.js';

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO locations (name, type, building, floor, room_number, description, org_unit_id, parent_location_id, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.name,
      data.type,
      data.building || null,
      data.floor || null,
      data.room_number || null,
      data.description || null,
      data.org_unit_id || null,
      data.parent_location_id || null,
      data.is_active
    ]
  );
  return rows[0];
}

export async function getById(id) {
  const { rows } = await pool.query(
    `SELECT l.*, 
            parent.name as parent_location_name,
            org.name as org_unit_name
     FROM locations l
     LEFT JOIN locations parent ON l.parent_location_id = parent.id
     LEFT JOIN org_units org ON l.org_unit_id = org.id
     WHERE l.id = $1`,
    [id]
  );
  return rows[0];
}

export async function list(filters = {}) {
  const conditions = [];
  const values = [];
  let paramCount = 0;

  if (filters.type) {
    paramCount++;
    conditions.push(`l.type = $${paramCount}`);
    values.push(filters.type);
  }

  if (filters.building) {
    paramCount++;
    conditions.push(`l.building ILIKE $${paramCount}`);
    values.push(`%${filters.building}%`);
  }

  if (filters.org_unit_id) {
    paramCount++;
    conditions.push(`l.org_unit_id = $${paramCount}`);
    values.push(filters.org_unit_id);
  }
  if (filters.org_unit_ids) {
    paramCount++;
    conditions.push(`l.org_unit_id = ANY($${paramCount}::uuid[])`);
    values.push(filters.org_unit_ids);
  }

  if (filters.is_active !== undefined) {
    paramCount++;
    conditions.push(`l.is_active = $${paramCount}`);
    values.push(filters.is_active);
  }

  if (filters.search) {
    paramCount++;
    conditions.push(`(l.name ILIKE $${paramCount} OR l.description ILIKE $${paramCount})`);
    values.push(`%${filters.search}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT l.*,
            parent.name as parent_location_name,
            org.name as org_unit_name,
            COUNT(*) OVER() as total_count
     FROM locations l
     LEFT JOIN locations parent ON l.parent_location_id = parent.id
     LEFT JOIN org_units org ON l.org_unit_id = org.id
     ${whereClause}
     ORDER BY l.building, l.floor, l.room_number, l.name
     LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
    [...values, filters.limit, filters.offset]
  );

  return {
    items: rows,
    total: rows.length > 0 ? parseInt(rows[0].total_count) : 0,
  };
}

export async function update(id, fields) {
  const allowed = ['name', 'type', 'building', 'floor', 'room_number', 'description', 'org_unit_id', 'parent_location_id', 'is_active'];
  const entries = Object.entries(fields).filter(([key]) => allowed.includes(key));
  
  if (entries.length === 0) {
    return getById(id);
  }

  const values = entries.map(([, value]) => value);
  const assignments = entries.map(([key], index) => `${key} = $${index + 1}`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE locations 
     SET ${assignments.join(', ')}, updated_at = now() 
     WHERE id = $${values.length} 
     RETURNING *`,
    values
  );

  return rows[0];
}

export async function deleteById(id) {
  const { rows } = await pool.query(
    'DELETE FROM locations WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0];
}

export async function getChildren(parentId) {
  const { rows } = await pool.query(
    `SELECT * FROM locations WHERE parent_location_id = $1 ORDER BY name`,
    [parentId]
  );
  return rows;
}

export async function hasAssets(locationId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*) as count FROM assets WHERE location_id = $1',
    [locationId]
  );
  return parseInt(rows[0].count) > 0;
}
