# Inventory Foundation API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your-token>
```

---

## 1. Organization Units

### List Organization Units
```http
GET /org-units?page=1&limit=20&type=club&is_active=true
```

### Create Organization Unit
```http
POST /org-units
Content-Type: application/json

{
  "type": "club",
  "name": "Photography Club",
  "code": "PHOTO-CLUB",
  "parent_id": "uuid",
  "is_active": true
}
```

### Get Organization Unit
```http
GET /org-units/:id
```

### Update Organization Unit
```http
PATCH /org-units/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "is_active": false
}
```

### Delete Organization Unit
```http
DELETE /org-units/:id
```

### Get Child Organization Units
```http
GET /org-units/:id/children
```

---

## 2. Categories

### List Categories
```http
GET /categories?page=1&limit=20&search=camera
```

### Create Category
```http
POST /categories
Content-Type: application/json

{
  "name": "DSLR Cameras",
  "parent_id": "uuid",
  "default_low_stock_threshold": 2,
  "default_loan_days": 7,
  "max_renewals": 2
}
```

### Get Category
```http
GET /categories/:id
```

### Update Category
```http
PATCH /categories/:id
Content-Type: application/json

{
  "default_loan_days": 14,
  "max_renewals": 3
}
```

### Delete Category
```http
DELETE /categories/:id
```

### Get Child Categories
```http
GET /categories/:id/children
```

---

## 3. Locations

### List Locations
```http
GET /locations?page=1&limit=20&building=SAC&type=storage
```

### Create Location
```http
POST /locations
Content-Type: application/json

{
  "name": "Main Storage",
  "type": "storage",
  "building": "Student Activity Center",
  "floor": "2",
  "room_number": "201",
  "description": "Primary storage for equipment",
  "org_unit_id": "uuid",
  "is_active": true
}
```

### Get Location
```http
GET /locations/:id
```

### Update Location
```http
PATCH /locations/:id
Content-Type: application/json

{
  "description": "Updated description",
  "is_active": true
}
```

### Delete Location
```http
DELETE /locations/:id
```

### Get Child Locations
```http
GET /locations/:id/children
```

---

## 4. Vendors

### List Vendors
```http
GET /vendors?page=1&limit=20&is_active=true&search=canon
```

### Create Vendor
```http
POST /vendors
Content-Type: application/json

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
  "notes": "Primary camera supplier",
  "is_active": true
}
```

### Get Vendor
```http
GET /vendors/:id
```

### Update Vendor
```http
PATCH /vendors/:id
Content-Type: application/json

{
  "contact_person": "Jane Smith",
  "email": "newsales@canon.co.in"
}
```

### Delete Vendor
```http
DELETE /vendors/:id
```

---

## 5. Purchases

### List Purchases
```http
GET /purchases?page=1&limit=20&payment_status=pending&from_date=2024-01-01
```

### Create Purchase
```http
POST /purchases
Content-Type: application/json

{
  "purchase_order_no": "PO-2024-001",
  "vendor_id": "uuid",
  "org_unit_id": "uuid",
  "purchase_date": "2024-01-15",
  "invoice_no": "INV-12345",
  "invoice_date": "2024-01-15",
  "total_amount": 50000.00,
  "tax_amount": 9000.00,
  "shipping_cost": 500.00,
  "other_charges": 200.00,
  "payment_status": "pending",
  "payment_method": "bank_transfer",
  "warranty_months": 12,
  "notes": "Camera equipment"
}
```

### Get Purchase
```http
GET /purchases/:id
```

### Update Purchase
```http
PATCH /purchases/:id
Content-Type: application/json

{
  "payment_status": "paid",
  "payment_date": "2024-01-20",
  "payment_reference": "TXN123456"
}
```

### Delete Purchase
```http
DELETE /purchases/:id
```

---

## 6. Purchase Items

### Get Purchase Items
```http
GET /purchases/:id/items
```

### Add Purchase Item
```http
POST /purchases/:id/items
Content-Type: application/json

{
  "description": "Canon EOS 90D DSLR Camera",
  "category_id": "uuid",
  "quantity": 2,
  "unit_price": 25000.00,
  "serial_numbers": ["SN123456", "SN123457"]
}
```

### Update Purchase Item
```http
PATCH /purchases/:id/items/:itemId
Content-Type: application/json

{
  "quantity": 3,
  "unit_price": 24000.00
}
```

### Delete Purchase Item
```http
DELETE /purchases/:id/items/:itemId
```

---

## Response Format

### Success Response
```json
{
  "data": {
    "id": "uuid",
    "name": "Item Name",
    ...
  }
}
```

### List Response with Pagination
```json
{
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": []
  }
}
```

---

## Common Error Codes

- `VALIDATION_ERROR` - Invalid request data (400)
- `UNAUTHORIZED` - Missing or invalid authentication (401)
- `FORBIDDEN` - Insufficient permissions (403)
- `NOT_FOUND` - Resource not found (404)
- `CONFLICT` - Resource conflict (e.g., duplicate code) (409)
- `INTERNAL_SERVER_ERROR` - Server error (500)

---

## Validation Rules

### Organization Units
- `type`: Required, non-empty string
- `name`: Required, non-empty string
- `code`: Required, non-empty string, unique
- `parent_id`: Optional, valid UUID
- `is_active`: Boolean, default true

### Categories
- `name`: Required, non-empty string, unique
- `default_low_stock_threshold`: Integer ≥ 0, default 0
- `default_loan_days`: Required, integer ≥ 1
- `max_renewals`: Integer ≥ 0, default 0
- `parent_id`: Optional, valid UUID

### Locations
- `name`: Required, non-empty string
- `type`: Required, non-empty string
- `building`, `floor`, `room_number`: Optional strings
- `org_unit_id`, `parent_location_id`: Optional, valid UUID
- `is_active`: Boolean, default true

### Vendors
- `name`: Required, non-empty string
- `code`: Required, non-empty string, unique
- `email`: Optional, valid email format
- `website`: Optional, valid URL format
- `is_active`: Boolean, default true

### Purchases
- `purchase_order_no`: Required, non-empty string, unique
- `vendor_id`: Required, valid UUID
- `org_unit_id`: Required, valid UUID
- `purchase_date`: Required, date format YYYY-MM-DD
- `total_amount`: Required, positive number
- `payment_status`: Enum: pending, partial, paid
- `payment_method`: Enum: bank_transfer, cheque, cash, card, upi

### Purchase Items
- `description`: Required, non-empty string
- `quantity`: Required, positive integer
- `unit_price`: Required, positive number
- `category_id`, `asset_id`: Optional, valid UUID
- `serial_numbers`: Optional, array of strings
