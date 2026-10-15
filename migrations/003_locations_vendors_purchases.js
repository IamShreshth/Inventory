export async function up(pgm) {
  // Locations table
  pgm.createTable('locations', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: {
      type: 'text',
      notNull: true,
    },
    type: {
      type: 'text',
      notNull: true,
      comment: 'building, room, lab, storage, etc.',
    },
    building: {
      type: 'text',
    },
    floor: {
      type: 'text',
    },
    room_number: {
      type: 'text',
    },
    description: {
      type: 'text',
    },
    org_unit_id: {
      type: 'uuid',
      references: 'org_units',
      onDelete: 'SET NULL',
    },
    parent_location_id: {
      type: 'uuid',
      references: 'locations',
      onDelete: 'SET NULL',
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true,
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

  pgm.createIndex('locations', 'org_unit_id');
  pgm.createIndex('locations', 'parent_location_id');
  pgm.createIndex('locations', ['building', 'floor', 'room_number']);

  // Vendors table
  pgm.createTable('vendors', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: {
      type: 'text',
      notNull: true,
    },
    code: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    contact_person: {
      type: 'text',
    },
    email: {
      type: 'text',
    },
    phone: {
      type: 'text',
    },
    address: {
      type: 'text',
    },
    city: {
      type: 'text',
    },
    state: {
      type: 'text',
    },
    country: {
      type: 'text',
    },
    pincode: {
      type: 'text',
    },
    gstin: {
      type: 'text',
      comment: 'GST Identification Number',
    },
    pan: {
      type: 'text',
      comment: 'PAN Number',
    },
    website: {
      type: 'text',
    },
    notes: {
      type: 'text',
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true,
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

  pgm.createIndex('vendors', 'code');
  pgm.createIndex('vendors', 'is_active');

  // Purchases table
  pgm.createTable('purchases', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    purchase_order_no: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    vendor_id: {
      type: 'uuid',
      references: 'vendors',
      notNull: true,
    },
    org_unit_id: {
      type: 'uuid',
      references: 'org_units',
      notNull: true,
    },
    purchase_date: {
      type: 'date',
      notNull: true,
    },
    invoice_no: {
      type: 'text',
    },
    invoice_date: {
      type: 'date',
    },
    total_amount: {
      type: 'numeric(14,2)',
      notNull: true,
    },
    tax_amount: {
      type: 'numeric(14,2)',
      default: 0,
    },
    shipping_cost: {
      type: 'numeric(14,2)',
      default: 0,
    },
    other_charges: {
      type: 'numeric(14,2)',
      default: 0,
    },
    grand_total: {
      type: 'numeric(14,2)',
      notNull: true,
    },
    payment_status: {
      type: 'text',
      notNull: true,
      default: 'pending',
      comment: 'pending, partial, paid',
    },
    payment_method: {
      type: 'text',
      comment: 'bank_transfer, cheque, cash, card, upi',
    },
    payment_date: {
      type: 'date',
    },
    payment_reference: {
      type: 'text',
    },
    warranty_months: {
      type: 'integer',
      default: 0,
    },
    notes: {
      type: 'text',
    },
    purchased_by: {
      type: 'uuid',
      references: 'users',
      notNull: true,
    },
    approved_by: {
      type: 'uuid',
      references: 'users',
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

  pgm.createIndex('purchases', 'vendor_id');
  pgm.createIndex('purchases', 'org_unit_id');
  pgm.createIndex('purchases', 'purchase_date');
  pgm.createIndex('purchases', 'payment_status');
  pgm.createIndex('purchases', 'purchased_by');

  // Purchase items table
  pgm.createTable('purchase_items', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    purchase_id: {
      type: 'uuid',
      references: 'purchases',
      notNull: true,
      onDelete: 'CASCADE',
    },
    asset_id: {
      type: 'uuid',
      references: 'assets',
      comment: 'Linked after asset creation',
    },
    description: {
      type: 'text',
      notNull: true,
    },
    category_id: {
      type: 'uuid',
      references: 'categories',
    },
    quantity: {
      type: 'integer',
      notNull: true,
      default: 1,
    },
    unit_price: {
      type: 'numeric(14,2)',
      notNull: true,
    },
    total_price: {
      type: 'numeric(14,2)',
      notNull: true,
    },
    serial_numbers: {
      type: 'text[]',
      comment: 'Array of serial numbers if applicable',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('purchase_items', 'purchase_id');
  pgm.createIndex('purchase_items', 'asset_id');
}

export async function down(pgm) {
  pgm.dropTable('purchase_items', { cascade: true });
  pgm.dropTable('purchases', { cascade: true });
  pgm.dropTable('vendors', { cascade: true });
  pgm.dropTable('locations', { cascade: true });
}
