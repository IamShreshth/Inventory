// migrations/006_audit_log_table.js

export async function up(pgm) {
  pgm.createTable('audit_log', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    table_name: {
      type: 'text',
      notNull: true,
    },
    record_id: {
      type: 'uuid',
      notNull: true,
    },
    action: {
      type: 'text',
      notNull: true,
      comment: 'Action performed: create, update, delete, issue, return, cancel, etc.',
    },
    changed_by: {
      type: 'uuid',
      references: 'users',
      onDelete: 'SET NULL',
    },
    old_data: {
      type: 'jsonb',
      comment: 'Previous state of the record',
    },
    new_data: {
      type: 'jsonb',
      comment: 'New state of the record',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // Indexes for common queries
  pgm.createIndex('audit_log', 'table_name');
  pgm.createIndex('audit_log', 'record_id');
  pgm.createIndex('audit_log', ['table_name', 'record_id']);
  pgm.createIndex('audit_log', 'created_at');
  pgm.createIndex('audit_log', 'changed_by');

  // Comment on table
  pgm.sql(`COMMENT ON TABLE audit_log IS 'Append-only audit trail for all critical operations'`);
}

export async function down(pgm) {
  pgm.dropTable('audit_log');
}
