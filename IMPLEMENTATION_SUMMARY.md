# Inventory Foundation Implementation

## Summary

Successfully implemented the foundational modules for the gymkhana inventory system:

1. **Organization Units (org_units)** - Organizations and departments
2. **Categories** - Asset categories with loan policies
3. **Locations** - Physical locations for assets
4. **Vendors** - Vendor management
5. **Purchases** - Purchase orders and purchase items

---

## API Endpoints

### Organization Units
- `GET /api/v1/org-units` - List all organization units (paginated)
- `POST /api/v1/org-units` - Create new organization unit
- `GET /api/v1/org-units/:id` - Get organization unit by ID
- `PATCH /api/v1/org-units/:id` - Update organization unit
- `DELETE /api/v1/org-units/:id` - Delete organization unit
- `GET /api/v1/org-units/:id/children` - Get child organization units

**Query Parameters (List):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `type` - Filter by organization type
- `is_active` - Filter by active status (true/false)
- `parent_id` - Filter by parent organization

**Example Request:**
```json
POST /api/v1/org-units
{
  "type": "club",
  "name": "Photography Club",
  "code": "PHOTO-CLUB",
  "parent_id": "uuid-of-parent",
  "is_active": true
}
```

---

### Categories
- `GET /api/v1/categories` - List all categories (paginated)
- `POST /api/v1/categories` - Create new category
- `GET /api/v1/categories/:id` - Get category by ID
- `PATCH /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category
- `GET /api/v1/categories/:id/children` - Get child categories

**Query Parameters (List):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `parent_id` - Filter by parent category
- `search` - Search by name

**Example Request:**
```json
POST /api/v1/categories
{
  "name": "Cameras",
  "parent_id": "uuid-of-parent-category",
  "default_low_stock_threshold": 2,
  "default_loan_days": 7,
  "max_renewals": 2
}
```

---

### Locations
- `GET /api/v1/locations` - List all locations (paginated)
- `POST /api/v1/locations` - Create new location
- `GET /api/v1/locations/:id` - Get location by ID
- `PATCH /api/v1/locations/:id` - Update location
- `DELETE /api/v1/locations/:id` - Delete location
- `GET /api/v1/locations/:id/children` - Get child locations

**Query Parameters (List):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `type` - Filter by location type
- `building` - Filter by building
- `org_unit_id` - Filter by organization unit
- `is_active` - Filter by active status (true/false)
- `search` - Search by name or description

**Example Request:**
```json
POST /api/v1/locations
{
  "name": "Main Storage Room",
  "type": "storage",
  "building": "Student Activity Center",
  "floor": "2",
  "room_number": "201",
  "description": "Primary storage for club equipment",
  "org_unit_id": "uuid-of-org-unit",
  "is_active": true
}
```

---

### Vendors
- `GET /api/v1/vendors` - List all vendors (paginated)
- `POST /api/v1/vendors` - Create new vendor
- `GET /api/v1/vendors/:id` - Get vendor by ID
- `PATCH /api/v1/vendors/:id` - Update vendor
- `DELETE /api/v1/vendors/:id` - Delete vendor

**Query Parameters (List):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `is_active` - Filter by active status (true/false)
- `search` - Search by name, code, or contact person

**Example Request:**
```json
POST /api/v1/vendors
{
  "name": "Canon India Pvt Ltd",
  "code": "CANON-IND",
  "contact_person": "John Doe",
  "email": "sales@canon.co.in",
  "phone": "+91-9876543210",
  "address": "123 Business Park",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "pincode": "400001",
  "gstin": "27AAACC1206D1ZM",
  "pan": "AAACC1206D",
  "website": "https://www.canon.co.in",
  "notes": "Primary camera equipment supplier",
  "is_active": true
}
```

---

### Purchases
- `GET /api/v1/purchases` - List all purchases (paginated)
- `POST /api/v1/purchases` - Create new purchase
- `GET /api/v1/purchases/:id` - Get purchase by ID
- `PATCH /api/v1/purchases/:id` - Update purchase
- `DELETE /api/v1/purchases/:id` - Delete purchase
- `GET /api/v1/purchases/:id/items` - Get all items in a purchase
- `POST /api/v1/purchases/:id/items` - Add item to purchase
- `PATCH /api/v1/purchases/:id/items/:itemId` - Update purchase item
- `DELETE /api/v1/purchases/:id/items/:itemId` - Delete purchase item

**Query Parameters (List):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `vendor_id` - Filter by vendor
- `org_unit_id` - Filter by organization unit
- `payment_status` - Filter by payment status (pending/partial/paid)
- `from_date` - Filter from purchase date (YYYY-MM-DD)
- `to_date` - Filter to purchase date (YYYY-MM-DD)
- `search` - Search by purchase order number or invoice number

**Example Request (Create Purchase):**
```json
POST /api/v1/purchases
{
  "purchase_order_no": "PO-2024-001",
  "vendor_id": "uuid-of-vendor",
  "org_unit_id": "uuid-of-org-unit",
  "purchase_date": "2024-01-15",
  "invoice_no": "INV-12345",
  "invoice_date": "2024-01-15",
  "total_amount": 50000.00,
  "tax_amount": 9000.00,
  "shipping_cost": 500.00,
  "other_charges": 200.00,
  "grand_total": 59700.00,
  "payment_status": "pending",
  "payment_method": "bank_transfer",
  "warranty_months": 12,
  "notes": "Camera equipment for photography club"
}
```

**Example Request (Add Purchase Item):**
```json
POST /api/v1/purchases/:id/items
{
  "description": "Canon EOS 90D DSLR Camera",
  "category_id": "uuid-of-category",
  "quantity": 2,
  "unit_price": 25000.00,
  "serial_numbers": ["SN123456", "SN123457"]
}
```

---

## Database Schema

### Tables Created

**locations**
- Physical location management with hierarchical structure
- Links to organization units
- Tracks building, floor, room number

**vendors**
- Vendor/supplier information
- Contact details, tax information (GSTIN, PAN)
- Unique vendor codes

**purchases**
- Purchase order tracking
- Financial details (amounts, taxes, shipping)
- Payment status and information
- Links to vendor, org unit, and users

**purchase_items**
- Individual items in a purchase order
- Quantity, pricing, serial numbers
- Can be linked to assets later

---

## Features Implemented

### Business Logic
- **Validation**: All inputs validated with Zod schemas
- **Uniqueness checks**: Prevents duplicate codes/names
- **Referential integrity**: Validates foreign key relationships
- **Hierarchical structures**: Support for parent-child relationships
- **Audit fields**: Automatic timestamps (created_at, updated_at)
- **Soft deletes**: Active/inactive flags for safe data management

### Security
- All endpoints require authentication
- User context available in requests (req.user)
- Error handling with custom AppError class
- SQL injection prevention via parameterized queries

### API Standards
- RESTful design
- Consistent response format: `{ data: {...}, meta: {...} }`
- Pagination support on list endpoints
- Proper HTTP status codes
- Detailed error messages

---

## Technical Architecture

### Module Structure (Layered)
Each module follows the same pattern:

```
src/modules/{module}/
├── {module}.routes.js      # Route definitions
├── {module}.controller.js  # Request/response handling
├── {module}.service.js     # Business logic
├── {module}.repository.js  # Database queries
└── {module}.schemas.js     # Zod validation schemas
```

### Database
- PostgreSQL with raw SQL queries
- Connection pooling via pg library
- Migrations using node-pg-migrate
- UUID primary keys
- Proper indexing for performance

---

## Next Steps

Consider implementing:
1. **Assets module** - Main asset inventory (table already exists)
2. **Loans/Issues module** - Asset checkout/return system
3. **Maintenance module** - Asset maintenance tracking
4. **Reports module** - Analytics and reporting
5. **Authorization** - Role-based access control (roles system already exists)
6. **File uploads** - Support for documents, images
7. **Audit logs** - Track all changes to entities
8. **Notifications** - Email/SMS for important events

---

## Testing

To test the endpoints, you need to:

1. Start the server:
```bash
npm run dev
```

2. Get an authentication token (login/register via `/api/v1/auth` endpoints)

3. Make requests with the token:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v1/org-units
```

---

## Files Created

### Modules
- `src/modules/org_units/*` (5 files)
- `src/modules/categories/*` (5 files)
- `src/modules/locations/*` (5 files)
- `src/modules/vendors/*` (5 files)
- `src/modules/purchases/*` (5 files)

### Supporting Files
- `migrations/003_locations_vendors_purchases.js` - Database migration
- `src/shared/app-error.js` - Custom error class
- `run-migration-003.js` - Migration script (can be deleted)
- `check-migrations.js` - Migration checker (can be deleted)

### Modified Files
- `server.js` - Added route mounting and error handling

---

## Database Migration Status

✅ Migration `003_locations_vendors_purchases` applied successfully
- Created 4 new tables: locations, vendors, purchases, purchase_items
- Created 14 indexes for query optimization
- All foreign key constraints in place
