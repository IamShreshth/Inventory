import 'dotenv/config';
import { pool } from '../src/db/pool.js';

// Set test environment
process.env.NODE_ENV = 'test';

// Global test setup
export async function setup() {
  console.log('Setting up test environment...');
  // Run migrations if needed
}

// Global test teardown
export async function teardown() {
  console.log('Tearing down test environment...');
  await pool.end();
}

// Hooks
beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});
