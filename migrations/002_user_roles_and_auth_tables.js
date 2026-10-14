/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const up = (pgm) => {
  // User roles table
  pgm.createTable('user_roles', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'RESTRICT' },
    org_unit_id: { type: 'uuid', references: 'org_units(id)', onDelete: 'RESTRICT' },
    role: {
      type: 'text',
      notNull: true,
      check: "role IN ('super_admin', 'org_admin', 'berm_incharge', 'borrower', 'auditor')",
    },
    position_title: { type: 'text' },
    academic_year: { type: 'text' },
    term_start: { type: 'date' },
    term_end: { type: 'date' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('user_roles', 'user_roles_term_check', {
    check: 'term_end IS NULL OR term_start IS NULL OR term_end >= term_start',
  });

  pgm.createIndex('user_roles', 'user_id');
  pgm.createIndex('user_roles', 'org_unit_id');
  pgm.createIndex('user_roles', ['user_id', 'role']);

  // Password reset tokens table
  pgm.createTable('password_reset_tokens', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    token_hash: { type: 'text', notNull: true, unique: true },
    expires_at: { type: 'timestamptz', notNull: true },
    used_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('password_reset_tokens', 'token_hash');
  pgm.createIndex('password_reset_tokens', ['user_id', 'expires_at']);

  // Refresh tokens table (for stateful refresh token management)
  pgm.createTable('refresh_tokens', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    token_hash: { type: 'text', notNull: true, unique: true },
    expires_at: { type: 'timestamptz', notNull: true },
    revoked_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('refresh_tokens', 'token_hash');
  pgm.createIndex('refresh_tokens', ['user_id', 'revoked_at']);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const down = (pgm) => {
  pgm.dropTable('refresh_tokens');
  pgm.dropTable('password_reset_tokens');
  pgm.dropTable('user_roles');
};
