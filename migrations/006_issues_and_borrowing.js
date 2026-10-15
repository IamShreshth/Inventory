/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const up = (pgm) => {
  // Drop boxes table
  pgm.createTable('drop_boxes', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'text', notNull: true },
    location_id: { type: 'uuid', notNull: true, references: 'locations(id)', onDelete: 'RESTRICT' },
    org_unit_id: { type: 'uuid', references: 'org_units(id)', onDelete: 'SET NULL' },
    qr_token_hash: { type: 'text', unique: true },
    description: { type: 'text' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('drop_boxes', 'location_id');
  pgm.createIndex('drop_boxes', 'qr_token_hash');

  // Issues table (borrow requests/loans)
  pgm.createTable('issues', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    asset_id: { type: 'uuid', notNull: true, references: 'assets(id)', onDelete: 'RESTRICT' },
    quantity: { type: 'integer', notNull: true, check: 'quantity > 0' },
    borrower_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'RESTRICT' },
    on_behalf_of_org: { type: 'uuid', references: 'org_units(id)', onDelete: 'SET NULL' },
    purpose: { type: 'text' },
    status: {
      type: 'text',
      notNull: true,
      check: "status IN ('requested', 'active', 'dropped', 'returned', 'cancelled')",
    },
    requested_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    issued_at: { type: 'timestamptz' },
    due_at: { type: 'timestamptz' },
    dropped_at: { type: 'timestamptz' },
    returned_at: { type: 'timestamptz' },
    issued_by: { type: 'uuid', references: 'users(id)', onDelete: 'RESTRICT' },
    drop_box_id: { type: 'uuid', references: 'drop_boxes(id)', onDelete: 'SET NULL' },
    received_by: { type: 'uuid', references: 'users(id)', onDelete: 'RESTRICT' },
    return_condition: { type: 'text' },
    remarks: { type: 'text' },
    cancellation_reason: { type: 'text' },
    renewal_count: { type: 'integer', notNull: true, default: 0, check: 'renewal_count >= 0' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('issues', ['asset_id', 'status']);
  pgm.createIndex('issues', ['borrower_id', 'status']);
  pgm.createIndex('issues', 'due_at', { where: "status IN ('active', 'dropped')" });
  pgm.createIndex('issues', 'status');

  // Loan renewals table
  pgm.createTable('loan_renewals', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    issue_id: { type: 'uuid', notNull: true, references: 'issues(id)', onDelete: 'CASCADE' },
    requested_by: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'RESTRICT' },
    approved_by: { type: 'uuid', references: 'users(id)', onDelete: 'RESTRICT' },
    previous_due_at: { type: 'timestamptz', notNull: true },
    new_due_at: { type: 'timestamptz', notNull: true },
    status: {
      type: 'text',
      notNull: true,
      default: 'pending',
      check: "status IN ('pending', 'approved', 'rejected')",
    },
    reason: { type: 'text' },
    rejection_reason: { type: 'text' },
    requested_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    decision_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('loan_renewals', 'issue_id');
  pgm.createIndex('loan_renewals', ['status', 'requested_at']);

  // Borrower blocks table
  pgm.createTable('borrower_blocks', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    issue_id: { type: 'uuid', references: 'issues(id)', onDelete: 'SET NULL' },
    reason: { type: 'text', notNull: true },
    blocked_by: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'RESTRICT' },
    blocked_until: { type: 'timestamptz' },
    lifted_by: { type: 'uuid', references: 'users(id)', onDelete: 'RESTRICT' },
    lifted_at: { type: 'timestamptz' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('borrower_blocks', 'user_id');
  pgm.createIndex('borrower_blocks', ['user_id', 'is_active']);

  // Notifications table
  pgm.createTable('notifications', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    type: { type: 'text', notNull: true },
    title: { type: 'text', notNull: true },
    message: { type: 'text', notNull: true },
    entity_type: { type: 'text' },
    entity_id: { type: 'uuid' },
    read_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('notifications', 'user_id');
  pgm.createIndex('notifications', ['user_id', 'read_at']);
  pgm.createIndex('notifications', ['user_id', 'created_at']);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const down = (pgm) => {
  pgm.dropTable('notifications');
  pgm.dropTable('borrower_blocks');
  pgm.dropTable('loan_renewals');
  pgm.dropTable('issues');
  pgm.dropTable('drop_boxes');
};
