import argon2 from 'argon2';
import { pool } from '../src/db/pool.js';

async function createTestUser() {
  try {
    console.log('Creating test user...\n');

    const testUser = {
      full_name: 'Test User',
      institute_email: 'test@example.com',
      roll_no: 'TEST001',
      phone: '1234567890',
      programme: 'Computer Science',
      password: 'password123',
    };

    // Check if user already exists
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE institute_email = $1 OR roll_no = $2',
      [testUser.institute_email, testUser.roll_no]
    );

    if (existing.length > 0) {
      console.log('✓ Test user already exists!');
      console.log('\n═══════════════════════════════════════');
      console.log('TEST USER CREDENTIALS:');
      console.log('═══════════════════════════════════════');
      console.log('Email:    test@example.com');
      console.log('Password: password123');
      console.log('═══════════════════════════════════════\n');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await argon2.hash(testUser.password);

    // Create user
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, institute_email, roll_no, phone, programme, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, institute_email, roll_no`,
      [
        testUser.full_name,
        testUser.institute_email,
        testUser.roll_no,
        testUser.phone,
        testUser.programme,
        hashedPassword,
      ]
    );

    const user = rows[0];

    // Assign borrower role
    await pool.query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, 'borrower')`,
      [user.id]
    );

    console.log('✓ Test user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('TEST USER CREDENTIALS:');
    console.log('═══════════════════════════════════════');
    console.log('Email:    test@example.com');
    console.log('Password: password123');
    console.log('Role:     borrower');
    console.log('═══════════════════════════════════════');
    console.log('\nYou can now login at: http://localhost:3000/login\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();
