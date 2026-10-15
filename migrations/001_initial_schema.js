/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const up = (pgm) => {
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    full_name: { type: 'text', notNull: true },
    institute_email: { type: 'text', notNull: true, unique: true },
    roll_no: { type: 'text', notNull: true, unique: true },
    phone: { type: 'text' },
    programme: { type: 'text' },
    admission_year: { type: 'integer' },
    password_hash: { type: 'text' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('org_units', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    type: { type: 'text', notNull: true },
    name: { type: 'text', notNull: true },
    code: { type: 'text', notNull: true, unique: true },
    parent_id: { type: 'uuid', references: 'org_units(id)', onDelete: 'RESTRICT' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('categories', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'text', notNull: true },
    parent_id: { type: 'uuid', references: 'categories(id)', onDelete: 'RESTRICT' },
    default_low_stock_threshold: { type: 'integer', notNull: true, default: 0 },
    default_loan_days: { type: 'integer', notNull: true },
    max_renewals: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('assets', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    asset_tag: { type: 'text', unique: true },
    name: { type: 'text', notNull: true },
    description: { type: 'text' },
    category_id: { type: 'uuid', notNull: true, references: 'categories(id)', onDelete: 'RESTRICT' },
    tracking: { type: 'text', notNull: true },
    quantity: { type: 'integer', notNull: true, default: 1 },
    low_stock_threshold: { type: 'integer', notNull: true, default: 0 },
    unit_cost: { type: 'numeric(14,2)' },
    serial_no: { type: 'text', unique: true },
    brand_model: { type: 'text' },
    condition: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true },
    owner_org_id: { type: 'uuid', references: 'org_units(id)', onDelete: 'RESTRICT' },
    home_berm_id: { type: 'uuid' },
    location_id: { type: 'uuid' },
    responsible_user_id: { type: 'uuid', references: 'users(id)', onDelete: 'RESTRICT' },
    is_issuable: { type: 'boolean', notNull: true, default: true },
    loan_days_override: { type: 'integer' },
    purchase_id: { type: 'uuid' },
    warranty_until: { type: 'date' },
    is_institute_asset: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('assets', ['category_id', 'status']);
  pgm.createIndex('assets', 'location_id');
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const down = (pgm) => {
  pgm.dropTable('assets');
  pgm.dropTable('categories');
  pgm.dropTable('org_units');
  pgm.dropTable('users');
};