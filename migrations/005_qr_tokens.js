/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const up = (pgm) => {
  // Create QR tokens table for assets and other entities
  pgm.createTable('qr_tokens', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    token_hash: { type: 'text', notNull: true, unique: true },
    entity_type: { type: 'text', notNull: true },
    entity_id: { type: 'uuid', notNull: true },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    disabled_at: { type: 'timestamptz' },
  });

  // Index for fast token lookup
  pgm.createIndex('qr_tokens', 'token_hash');
  
  // Index for entity lookups
  pgm.createIndex('qr_tokens', ['entity_type', 'entity_id']);
  
  // Index for active tokens
  pgm.createIndex('qr_tokens', 'is_active', { where: 'is_active = true' });
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
export const down = (pgm) => {
  pgm.dropTable('qr_tokens');
};
