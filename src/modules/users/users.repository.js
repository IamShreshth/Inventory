// src/modules/users/users.repository.js
import { pool } from '../../db/pool.js';

export async function getUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE institute_email = $1',
    [email]
  );
  return rows[0];
}

export async function createUser(userData) {
  const { rows } = await pool.query(
    `INSERT INTO users (full_name, institute_email, roll_no, phone, programme, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userData.full_name, userData.institute_email, userData.roll_no, userData.phone, userData.programme, userData.password_hash]
  );
  return rows[0];
}