// src/modules/roles/roles.repository.js
import { pool } from '../../db/pool.js';

export async function createRole(roleData) {
  const { rows } = await pool.query(
    `INSERT INTO user_roles (user_id, org_unit_id, role, position_title, academic_year, term_start, term_end)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, user_id, org_unit_id, role, position_title, academic_year, term_start, term_end, created_at, updated_at`,
    [
      roleData.user_id,
      roleData.org_unit_id || null,
      roleData.role,
      roleData.position_title || null,
      roleData.academic_year || null,
      roleData.term_start || null,
      roleData.term_end || null,
    ]
  );
  return rows[0];
}

export async function getRolesByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT ur.id, ur.user_id, ur.org_unit_id, ur.role, ur.position_title, 
            ur.academic_year, ur.term_start, ur.term_end, ur.created_at, ur.updated_at,
            ou.name as org_name, ou.code as org_code
     FROM user_roles ur
     LEFT JOIN org_units ou ON ur.org_unit_id = ou.id
     WHERE ur.user_id = $1
     ORDER BY ur.created_at DESC`,
    [userId]
  );
  return rows;
}

export async function getRoleById(roleId) {
  const { rows } = await pool.query(
    `SELECT ur.id, ur.user_id, ur.org_unit_id, ur.role, ur.position_title,
            ur.academic_year, ur.term_start, ur.term_end, ur.created_at, ur.updated_at,
            ou.name as org_name, ou.code as org_code
     FROM user_roles ur
     LEFT JOIN org_units ou ON ur.org_unit_id = ou.id
     WHERE ur.id = $1`,
    [roleId]
  );
  return rows[0];
}

export async function updateRole(roleId, fields) {
  const allowed = ['org_unit_id', 'role', 'position_title', 'academic_year', 'term_start', 'term_end'];
  const entries = Object.entries(fields).filter(([key]) => allowed.includes(key));
  if (!entries.length) return getRoleById(roleId);

  const values = entries.map(([, value]) => value);
  const assignments = entries.map(([key], index) => `${key} = $${index + 1}`);
  values.push(roleId);

  const { rows } = await pool.query(
    `UPDATE user_roles 
     SET ${assignments.join(', ')}, updated_at = now() 
     WHERE id = $${values.length}
     RETURNING id, user_id, org_unit_id, role, position_title, academic_year, term_start, term_end, created_at, updated_at`,
    values
  );
  return rows[0];
}

export async function deleteRole(roleId) {
  const { rows } = await pool.query(
    'DELETE FROM user_roles WHERE id = $1 RETURNING id',
    [roleId]
  );
  return rows[0];
}

export async function getActiveRolesForUser(userId) {
  const now = new Date().toISOString().split('T')[0]; // Get current date
  const { rows } = await pool.query(
    `SELECT ur.id, ur.user_id, ur.org_unit_id, ur.role, ur.position_title,
            ur.academic_year, ur.term_start, ur.term_end, ur.created_at, ur.updated_at,
            ou.name as org_name, ou.code as org_code
     FROM user_roles ur
     LEFT JOIN org_units ou ON ur.org_unit_id = ou.id
     WHERE ur.user_id = $1
       AND (ur.term_start IS NULL OR ur.term_start <= $2)
       AND (ur.term_end IS NULL OR ur.term_end >= $2)
     ORDER BY ur.created_at DESC`,
    [userId, now]
  );
  return rows;
}
