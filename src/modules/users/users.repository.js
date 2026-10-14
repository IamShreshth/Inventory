// src/modules/users/users.repository.js
import { pool } from '../../db/pool.js';

export async function getUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id, full_name, institute_email, roll_no, phone, programme, admission_year, is_active, created_at, updated_at FROM users WHERE institute_email = $1',
    [email]
  );
  return rows[0];
}

export async function createUser(userData) {
  const { rows } = await pool.query(
    `INSERT INTO users (full_name, institute_email, roll_no, phone, programme, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, full_name, institute_email, roll_no, phone, programme, admission_year, is_active, created_at, updated_at`,
    [userData.full_name, userData.institute_email, userData.roll_no, userData.phone, userData.programme, userData.password_hash]
  );
  return rows[0];
}

export async function listUsers({ limit, offset, q }) {
  const values = [];
  const filters = [];

  if (q) {
    values.push(`%${q}%`);
    filters.push(`(full_name ILIKE $${values.length} OR institute_email ILIKE $${values.length} OR roll_no ILIKE $${values.length})`);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const count = await pool.query(`SELECT COUNT(*)::int AS total FROM users ${where}`, values);
  values.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT id, full_name, institute_email, roll_no, phone, programme, admission_year, is_active, created_at, updated_at
     FROM users ${where} ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );
  return { rows, total: count.rows[0].total };
}

export async function getUserById(id) {
  const { rows } = await pool.query(
    'SELECT id, full_name, institute_email, roll_no, phone, programme, admission_year, is_active, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0];
}

export async function updateUser(id, fields) {
  const allowed = ['full_name', 'phone', 'programme', 'is_active'];
  const entries = Object.entries(fields).filter(([key]) => allowed.includes(key));
  if (!entries.length) return getUserById(id);

  const values = entries.map(([, value]) => value);
  const assignments = entries.map(([key], index) => `${key} = $${index + 1}`);
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE users SET ${assignments.join(', ')}, updated_at = now() WHERE id = $${values.length}
     RETURNING id, full_name, institute_email, roll_no, phone, programme, admission_year, is_active, created_at, updated_at`,
    values
  );
  return rows[0];
}

export async function deactivateUser(id) {
  return updateUser(id, { is_active: false });
}