// migrations/007_transfers_maintenance_disposals.js

export async function up(pgm) {
  // ============================================================================
  // TRANSFERS TABLE
  // ============================================================================
  pgm.createTable('transfers', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    asset_id: {
      type: 'uuid',
      notNull: true,
      references: 'assets',
      onDelete: 'RESTRICT',
    },
    quantity: {
      type: 'integer',
      notNull: true,
      check: 'quantity > 0',
    },
    from_org_id: {
      type: 'uuid',
      references: 'org_units',
      onDelete: 'RESTRICT',
    },
    to_org_id: {
      type: 'uuid',
      references: 'org_units',
      onDelete: 'RESTRICT',
    },
    from_location_id: {
      type: 'uuid',
      references: 'locations',
      onDelete: 'SET NULL',
    },
    to_location_id: {
      type: 'uuid',
      references: 'locations',
      onDelete: 'SET NULL',
    },
    from_user_id: {
      type: 'uuid',
      references: 'users',
      onDelete: 'SET NULL',
    },
    to_user_id: {
      type: 'uuid',
      references: 'users',
      onDelete: 'SET NULL',
    },
    reason: {
      type: 'text',
      notNull: true,
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'requested',
      check: "status IN ('requested', 'approved', 'rejected', 'completed', 'cancelled')",
    },
    requested_by: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'RESTRICT',
    },
    approved_by: {
      type: 'uuid',
      references: 'users',
      onDelete: 'RESTRICT',
    },
    rejected_by: {
      type: 'uuid',
      references: 'users',
      onDelete: 'RESTRICT',
    },
    completed_by: {
      type: 'uuid',
      references: 'users',
      onDelete: 'RESTRICT',
    },
    rejection_reason: {
      type: 'text',
    },
    cancellation_reason: {
      type: 'text',
    },
    requested_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    approved_at: {
      type: 'timestamptz',
    },
    rejected_at: {
      type: 'timestamptz',
    },
    completed_at: {
      type: 'timestamptz',
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

  pgm.createIndex('transfers', 'asset_id');
  pgm.createIndex('transfers', 'status');
  pgm.createIndex('transfers', ['status', 'requested_at']);
  pgm.createIndex('transfers', 'from_org_id');
  pgm.createIndex('transfers', 'to_org_id');

  // ============================================================================
  // MAINTENANCE RECORDS TABLE
  // ============================================================================
  pgm.createTable('maintenance_records', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    asset_id: {
      type: 'uuid',
      notNull: true,
      references: 'assets',
      onDelete: 'RESTRICT',
    },
    type: {
      type: 'text',
      notNull: true,
      check: "type IN ('repair', 'preventive', 'inspection', 'calibration', 'upgrade', 'other')",
    },
    description: {
      type: 'text',
      notNull: true,
    },
    reported_by: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'RESTRICT',
    },
    vendor_id: {
      type: 'uuid',
      references: 'vendors',
      onDelete: 'SET NULL',
    },
    cost: {
      type: 'numeric(14,2)',
      check: 'cost >= 0',
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'reported',
      check: "status IN ('reported', 'in_progress', 'resolved', 'cancelled')",
    },
    resolved_at: {
      type: 'timestamptz',
    },
    resolved_by: {
      type: 'uuid',
      references: 'users',
      onDelete: 'RESTRICT',
    },
    condition_after: {
      type: 'text',
    },
    notes: {
      type: 'text',
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

  pgm.createIndex('maintenance_records', 'asset_id');
  pgm.createIndex('maintenance_records', 'status');
  pgm.createIndex('maintenance_records', ['status', 'created_at']);
  pgm.createIndex('maintenance_records', 'vendor_id');

  // ============================================================================
  // DISPOSALS TABLE
  // ============================================================================
  pgm.createTable('disposals', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    asset_id: {
      type: 'uuid',
      notNull: true,
      references: 'assets',
      onDelete: 'RESTRICT',
    },
    quantity: {
      type: 'integer',
      notNull: true,
      check: 'quantity > 0',
    },
    reason: {
      type: 'text',
      notNull: true,
      check: "reason IN ('damaged', 'obsolete', 'lost', 'stolen', 'end_of_life', 'other')",
    },
    details: {
      type: 'text',
    },
    proposed_by: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      onDelete: 'RESTRICT',
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'proposed',
      check: "status IN ('proposed', 'approved', 'rejected', 'completed')",
    },
    approved_by: {
      type: 'uuid',
      references: 'users',
      onDelete: 'RESTRICT',
    },
    rejected_by: {
      type: 'uuid',
      references: 'users',
      onDelete: 'RESTRICT',
    },
    rejection_reason: {
      type: 'text',
    },
    disposed_on: {
      type: 'date',
    },
    salvage_value: {
      type: 'numeric(14,2)',
      check: 'salvage_value >= 0',
    },
    approved_at: {
      type: 'timestamptz',
    },
    rejected_at: {
      type: 'timestamptz',
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

  pgm.createIndex('disposals', 'asset_id');
  pgm.createIndex('disposals', 'status');
  pgm.createIndex('disposals', ['status', 'created_at']);

  // Comments
  pgm.sql(`COMMENT ON TABLE transfers IS 'Asset transfer requests between org units/locations'`);
  pgm.sql(`COMMENT ON TABLE maintenance_records IS 'Asset maintenance and repair tracking'`);
  pgm.sql(`COMMENT ON TABLE disposals IS 'Asset disposal proposals and approvals'`);
}

export async function down(pgm) {
  pgm.dropTable('disposals');
  pgm.dropTable('maintenance_records');
  pgm.dropTable('transfers');
}
