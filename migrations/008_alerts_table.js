// migrations/005_alerts_table.js

export async function up(pgm) {
  pgm.createTable('alerts', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    type: {
      type: 'text',
      notNull: true,
      comment: 'Alert type: low_stock, overdue_loan, warranty_expiry, maintenance_due, etc.',
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'open',
      comment: 'Status: open, acknowledged, resolved, dismissed',
    },
    severity: {
      type: 'text',
      notNull: true,
      default: 'medium',
      comment: 'Severity: low, medium, high, critical',
    },
    message: {
      type: 'text',
      notNull: true,
    },
    title: {
      type: 'text',
      notNull: true,
    },
    // Entity references (polymorphic - not using FK)
    entity_type: {
      type: 'text',
      comment: 'Type of related entity: asset, issue, purchase, etc.',
    },
    entity_id: {
      type: 'uuid',
      comment: 'ID of related entity',
    },
    // Optional specific references with FKs
    asset_id: {
      type: 'uuid',
      references: 'assets',
      onDelete: 'CASCADE',
    },
    issue_id: {
      type: 'uuid',
      references: 'issues',
      onDelete: 'CASCADE',
    },
    org_unit_id: {
      type: 'uuid',
      references: 'org_units',
      onDelete: 'CASCADE',
    },
    // Metadata
    metadata: {
      type: 'jsonb',
      default: '{}',
      comment: 'Additional context data for the alert',
    },
    // Acknowledgement tracking
    acknowledged_by: {
      type: 'uuid',
      references: 'users',
      onDelete: 'SET NULL',
    },
    acknowledged_at: {
      type: 'timestamptz',
    },
    // Resolution tracking
    resolved_by: {
      type: 'uuid',
      references: 'users',
      onDelete: 'SET NULL',
    },
    resolved_at: {
      type: 'timestamptz',
    },
    resolution_notes: {
      type: 'text',
    },
    // Timestamps
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

  // Add constraints
  pgm.addConstraint('alerts', 'alerts_type_check', {
    check: "type IN ('low_stock', 'overdue_loan', 'warranty_expiry', 'maintenance_due', 'verification_pending', 'asset_inactive', 'disposal_pending', 'transfer_pending', 'system', 'custom')",
  });

  pgm.addConstraint('alerts', 'alerts_status_check', {
    check: "status IN ('open', 'acknowledged', 'resolved', 'dismissed')",
  });

  pgm.addConstraint('alerts', 'alerts_severity_check', {
    check: "severity IN ('low', 'medium', 'high', 'critical')",
  });

  // Indexes for common queries
  pgm.createIndex('alerts', 'type');
  pgm.createIndex('alerts', 'status');
  pgm.createIndex('alerts', 'severity');
  pgm.createIndex('alerts', 'asset_id');
  pgm.createIndex('alerts', 'issue_id');
  pgm.createIndex('alerts', 'org_unit_id');
  pgm.createIndex('alerts', 'created_at');
  pgm.createIndex('alerts', ['status', 'created_at']);
  pgm.createIndex('alerts', ['type', 'status']);
  pgm.createIndex('alerts', ['entity_type', 'entity_id']);

  // Composite index for deduplication checks
  pgm.createIndex('alerts', ['type', 'entity_type', 'entity_id', 'status'], {
    name: 'alerts_dedup_idx',
    where: "status IN ('open', 'acknowledged')",
  });

  // Add comment to table
  pgm.sql(`COMMENT ON TABLE alerts IS 'System-generated alerts and warnings for inventory management'`);
}

export async function down(pgm) {
  pgm.dropTable('alerts');
}
