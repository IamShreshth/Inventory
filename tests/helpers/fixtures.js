import { pool } from '../src/db/pool.js';

/**
 * Create a test user
 */
export async function createTestUser(userData = {}) {
  const defaultData = {
    full_name: 'Test User',
    institute_email: `test${Date.now()}@institute.edu`,
    roll_no: `TEST${Date.now()}`,
    phone: '+1234567890',
    programme: 'Computer Science',
    password_hash: '$argon2id$v=19$m=65536,t=3,p=4$test',
    is_active: true,
  };

  const data = { ...defaultData, ...userData };

  const { rows } = await pool.query(
    `INSERT INTO users (full_name, institute_email, roll_no, phone, programme, password_hash, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [data.full_name, data.institute_email, data.roll_no, data.phone, data.programme, data.password_hash, data.is_active]
  );

  return rows[0];
}

/**
 * Create a test category
 */
export async function createTestCategory(categoryData = {}) {
  const defaultData = {
    name: `Test Category ${Date.now()}`,
    default_low_stock_threshold: 0,
    default_loan_days: 14,
    max_renewals: 2,
  };

  const data = { ...defaultData, ...categoryData };

  const { rows } = await pool.query(
    `INSERT INTO categories (name, parent_id, default_low_stock_threshold, default_loan_days, max_renewals)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.name, data.parent_id || null, data.default_low_stock_threshold, data.default_loan_days, data.max_renewals]
  );

  return rows[0];
}

/**
 * Create a test org unit
 */
export async function createTestOrgUnit(orgData = {}) {
  const defaultData = {
    type: 'club',
    name: `Test Org ${Date.now()}`,
    code: `ORG${Date.now()}`,
    is_active: true,
  };

  const data = { ...defaultData, ...orgData };

  const { rows } = await pool.query(
    `INSERT INTO org_units (type, name, code, parent_id, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.type, data.name, data.code, data.parent_id || null, data.is_active]
  );

  return rows[0];
}

/**
 * Create a test asset
 */
export async function createTestAsset(assetData = {}) {
  const defaultData = {
    name: `Test Asset ${Date.now()}`,
    tracking: 'quantity',
    quantity: 10,
    low_stock_threshold: 2,
    condition: 'good',
    status: 'available',
    is_issuable: true,
    is_institute_asset: true,
  };

  const data = { ...defaultData, ...assetData };

  const { rows } = await pool.query(
    `INSERT INTO assets (
      asset_tag, name, description, category_id, tracking, quantity, 
      low_stock_threshold, unit_cost, serial_no, brand_model, condition, 
      status, owner_org_id, home_berm_id, location_id, responsible_user_id,
      is_issuable, loan_days_override, purchase_id, warranty_until, is_institute_asset
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
    RETURNING *`,
    [
      data.asset_tag || null,
      data.name,
      data.description || null,
      data.category_id,
      data.tracking,
      data.quantity,
      data.low_stock_threshold,
      data.unit_cost || null,
      data.serial_no || null,
      data.brand_model || null,
      data.condition,
      data.status,
      data.owner_org_id || null,
      data.home_berm_id || null,
      data.location_id || null,
      data.responsible_user_id || null,
      data.is_issuable,
      data.loan_days_override || null,
      data.purchase_id || null,
      data.warranty_until || null,
      data.is_institute_asset
    ]
  );

  return rows[0];
}

/**
 * Clean up test data
 */
export async function cleanupTestData() {
  await pool.query('DELETE FROM audit_log WHERE changed_by IS NULL OR changed_by IN (SELECT id FROM users WHERE institute_email LIKE \'test%@institute.edu\')');
  await pool.query('DELETE FROM qr_tokens WHERE entity_id IN (SELECT id FROM assets WHERE name LIKE \'Test Asset%\')');
  await pool.query('DELETE FROM assets WHERE name LIKE \'Test Asset%\'');
  await pool.query('DELETE FROM categories WHERE name LIKE \'Test Category%\'');
  await pool.query('DELETE FROM org_units WHERE name LIKE \'Test Org%\'');
  await pool.query('DELETE FROM users WHERE institute_email LIKE \'test%@institute.edu\'');
}

/**
 * Generate a mock PASETO token for testing
 */
export function generateMockToken(userId) {
  // This is a simplified mock - in real tests you'd use the actual token service
  return `mock.token.${userId}`;
}
