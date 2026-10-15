// migrations/008_verifications_attachments.js

export async function up(pgm) {
  // ============================================================================
  // VERIFICATION CYCLES TABLE
  // ============================================================================
  pgm.createTable('verification_cycles', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: {
      type: 'text',
      notNull: true,
    },
    org_unit_id: {
      type: 'uuid',
      notNull: true,
      references: 'org_units',
      onDelete: 'RESTRICT',
    },
    starts_on: {
      type: 'date',
      notNull: true,
    },
    ends_on: {
      type: 'date',
      notNull: true,
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'draft',
      check: "status IN ('draft', 'active', 'completed', 'cancelled')",
    },
    created_by: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'RESTRICT',
    },
    started_by: {
      type: 'uuid',
      references: 'users',
      onDelete: 'RESTRICT',
    },
    completed_by: {
      type: 'uuid',
      references: 'users',
      onDelete: 'RESTRICT',
    },
    cancelled_by: {
      type: 'uuid',
      references: 'users',
      onDelete: 'RESTRICT',
    },
    started_at: {
      type: 'timestamptz',
    },
    completed_at: {
      type: 'timestamptz',
    },
    cancelled_at: {
      type: 'timestamptz',
    },
    cancellation_reason: {
      type: 'text',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('verification_cycles', 'org_unit_id');
  pgm.createIndex('verification_cycles', 'status');
  pgm.createIndex('verification_cycles', ['status', 'starts_on']);
  pgm.addConstraint('verification_cycles', 'verification_cycles_dates_check', {
    check: 'ends_on >= starts_on',
  });

  // ============================================================================
  // VERIFICATIONS TABLE (individual asset verifications)
  // ============================================================================
  pgm.createTable('verifications', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    cycle_id: {
      type: 'uuid',
      notNull: true,
      references: 'verification_cycles',
      onDelete: 'CASCADE',
    },
    asset_id: {
      type: 'uuid',
      notNull: true,
      references: 'assets',
      onDelete: 'RESTRICT',
    },
    observed_condition: {
      type: 'text',
    },
    observed_location_id: {
      type: 'uuid',
      references: 'locations',
      onDelete: 'SET NULL',
    },
    observed_quantity: {
      type: 'integer',
      check: 'observed_quantity >= 0',
    },
    via_qr_scan: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    remarks: {
      type: 'text',
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'pending',
      check: "status IN ('pending', 'verified', 'missing', 'mismatch')",
    },
    verified_by: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'RESTRICT',
    },
    verified_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('verifications', 'cycle_id');
  pgm.createIndex('verifications', 'asset_id');
  pgm.createIndex('verifications', 'status');
  pgm.createIndex('verifications', ['cycle_id', 'asset_id']);
  
  // Prevent duplicate verifications for same asset in same cycle
  pgm.addConstraint('verifications', 'verifications_cycle_asset_unique', {
    unique: ['cycle_id', 'asset_id'],
  });

  // ============================================================================
  // ATTACHMENTS TABLE
  // ============================================================================
  pgm.createTable('attachments', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    entity_type: {
      type: 'text',
      notNull: true,
      check: "entity_type IN ('asset', 'issue', 'purchase', 'transfer', 'maintenance', 'disposal', 'verification_cycle', 'org_unit', 'user')",
    },
    entity_id: {
      type: 'uuid',
      notNull: true,
    },
    filename: {
      type: 'text',
      notNull: true,
    },
    original_filename: {
      type: 'text',
      notNull: true,
    },
    mime_type: {
      type: 'text',
      notNull: true,
    },
    size_bytes: {
      type: 'integer',
      notNull: true,
      check: 'size_bytes > 0',
    },
    storage_path: {
      type: 'text',
      notNull: true,
    },
    file_url: {
      type: 'text',
      comment: 'Optional external URL if not stored locally',
    },
    caption: {
      type: 'text',
    },
    uploaded_by: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'RESTRICT',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('attachments', 'entity_type');
  pgm.createIndex('attachments', 'entity_id');
  pgm.createIndex('attachments', ['entity_type', 'entity_id']);
  pgm.createIndex('attachments', 'uploaded_by');

  // Comments
  pgm.sql(`COMMENT ON TABLE verification_cycles IS 'Physical verification cycles for assets'`);
  pgm.sql(`COMMENT ON TABLE verifications IS 'Individual asset verification records within cycles'`);
  pgm.sql(`COMMENT ON TABLE attachments IS 'File attachments for various entities (polymorphic)'`);
}

export async function down(pgm) {
  pgm.dropTable('attachments');
  pgm.dropTable('verifications');
  pgm.dropTable('verification_cycles');
}
