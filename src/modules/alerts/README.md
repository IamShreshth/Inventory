# Alerts Module

System-generated alerts and warnings for inventory management in the BERM Inventory API.

## Overview

The alerts module provides automated monitoring and notification capabilities for critical inventory events such as:

- **Low Stock** - Assets below their threshold quantity
- **Overdue Loans** - Borrowed items past their due date
- **Warranty Expiry** - Assets with warranties expiring soon
- **Maintenance Due** - Assets requiring maintenance
- **Verification Pending** - Assets awaiting verification
- **System Alerts** - Custom system-generated warnings

## Features

- ✅ Automatic alert generation based on inventory conditions
- ✅ Deduplication to prevent duplicate alerts
- ✅ Alert lifecycle management (open → acknowledged → resolved)
- ✅ Auto-resolution when conditions are fixed
- ✅ Severity levels (low, medium, high, critical)
- ✅ Filtering and pagination
- ✅ Alert summaries and statistics
- ✅ Background job support for scheduled generation

## Database Schema

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL,           -- Alert type
  status TEXT NOT NULL,          -- open, acknowledged, resolved, dismissed
  severity TEXT NOT NULL,        -- low, medium, high, critical
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,              -- Related entity type
  entity_id UUID,                -- Related entity ID
  asset_id UUID,                 -- FK to assets
  issue_id UUID,                 -- FK to issues
  org_unit_id UUID,              -- FK to org_units
  metadata JSONB,                -- Additional context
  acknowledged_by UUID,          -- FK to users
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID,              -- FK to users
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## API Endpoints

### List Alerts
```http
GET /api/v1/alerts
```

Query Parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `type` - Filter by alert type
- `status` - Filter by status
- `severity` - Filter by severity
- `asset_id` - Filter by asset
- `issue_id` - Filter by issue
- `org_unit_id` - Filter by organization unit
- `sort` - Sort fields (e.g., `-created_at,severity`)

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "low_stock",
      "status": "open",
      "severity": "high",
      "title": "Low Stock: Laptop",
      "message": "Asset is below threshold",
      "asset_id": "uuid",
      "metadata": { "quantity": 5, "threshold": 10 },
      "created_at": "2024-10-15T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Get Alert by ID
```http
GET /api/v1/alerts/:id
```

### Create Alert (System/Admin)
```http
POST /api/v1/alerts
Content-Type: application/json

{
  "type": "low_stock",
  "severity": "high",
  "title": "Low Stock Alert",
  "message": "Asset quantity is below threshold",
  "entity_type": "asset",
  "entity_id": "uuid",
  "asset_id": "uuid",
  "org_unit_id": "uuid",
  "metadata": {}
}
```

### Update Alert
```http
PATCH /api/v1/alerts/:id
Content-Type: application/json

{
  "severity": "critical",
  "message": "Updated message"
}
```

### Acknowledge Alert
```http
POST /api/v1/alerts/:id/acknowledge
Content-Type: application/json

{
  "acknowledged_by": "uuid"  // Optional, defaults to authenticated user
}
```

### Resolve Alert
```http
POST /api/v1/alerts/:id/resolve
Content-Type: application/json

{
  "resolved_by": "uuid",  // Optional
  "resolution_notes": "Issue has been fixed"
}
```

### Dismiss Alert
```http
POST /api/v1/alerts/:id/dismiss
```

### Get Alert Summary
```http
GET /api/v1/alerts/summary?org_unit_id=uuid
```

Response:
```json
{
  "data": {
    "total_alerts": 100,
    "by_status": {
      "open": 45,
      "acknowledged": 20,
      "resolved": 30,
      "dismissed": 5
    },
    "by_severity": {
      "critical": 5,
      "high": 15,
      "medium": 50,
      "low": 30
    },
    "by_type": {
      "low_stock": 20,
      "overdue_loan": 15,
      "warranty_expiry": 10,
      "maintenance_due": 0
    }
  }
}
```

### Generate System Alerts (Admin)
```http
POST /api/v1/alerts/generate
```

Manually triggers alert generation for all alert types.

### Auto-Resolve Alerts (Admin)
```http
POST /api/v1/alerts/auto-resolve
```

Automatically resolves alerts where conditions have been fixed.

## Alert Types

### `low_stock`
Generated when an asset's quantity falls below its threshold.

**Severity Rules:**
- `critical` - Quantity is 0
- `high` - Below threshold

**Auto-resolves:** When quantity rises above threshold

### `overdue_loan`
Generated when a borrowed item is past its due date.

**Severity Rules:**
- `critical` - More than 30 days overdue
- `high` - More than 14 days overdue
- `medium` - Overdue

**Auto-resolves:** When item is returned or cancelled

### `warranty_expiry`
Generated when an asset's warranty is expiring soon (default: 30 days).

**Severity Rules:**
- `high` - Expires within 7 days
- `medium` - Expires within 14 days
- `low` - Expires within 30 days

### Custom Types
- `maintenance_due`
- `verification_pending`
- `asset_inactive`
- `disposal_pending`
- `transfer_pending`
- `system`
- `custom`

## Background Jobs

The alerts module includes background job utilities for scheduled execution.

### Setup with node-cron

```javascript
import cron from 'node-cron';
import * as alertJobs from './src/modules/alerts/alert-jobs.js';

// Generate alerts every hour
cron.schedule('0 * * * *', async () => {
  await alertJobs.runAlertGeneration();
});

// Auto-resolve fixed alerts every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  await alertJobs.runAutoResolve();
});

// Cleanup old alerts daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  await alertJobs.runAlertCleanup(90); // Delete alerts older than 90 days
});

// Run all jobs (recommended)
cron.schedule('0 * * * *', async () => {
  await alertJobs.runAllAlertJobs();
});
```

### Job Functions

- `runAlertGeneration()` - Generate all system alerts
- `runAutoResolve()` - Auto-resolve fixed alerts
- `runAlertCleanup(daysOld)` - Delete old resolved/dismissed alerts
- `runAllAlertJobs()` - Run all jobs in sequence
- `getAlertJobStats()` - Get job statistics

## Usage Examples

### Service Layer

```javascript
import * as alertsService from './src/modules/alerts/alerts.service.js';

// List alerts with filters
const alerts = await alertsService.listAlerts({
  limit: 20,
  offset: 0,
  filters: { status: 'open', severity: 'critical' },
  sort: '-created_at',
});

// Create a custom alert
const alert = await alertsService.createAlert({
  type: 'custom',
  severity: 'high',
  title: 'Custom Alert',
  message: 'Something requires attention',
  entity_type: 'asset',
  entity_id: assetId,
  asset_id: assetId,
});

// Acknowledge an alert
await alertsService.acknowledgeAlert(alertId, userId);

// Resolve an alert
await alertsService.resolveAlert(alertId, userId, 'Fixed the issue');

// Get summary
const summary = await alertsService.getAlertSummary({ org_unit_id: orgId });

// Generate all system alerts
const result = await alertsService.generateAllSystemAlerts();
```

### Repository Layer

```javascript
import * as alertsRepository from './src/modules/alerts/alerts.repository.js';

// Find existing alert (for deduplication)
const existing = await alertsRepository.findExistingAlert({
  type: 'low_stock',
  entity_type: 'asset',
  entity_id: assetId,
});

// Create alert
const alert = await alertsRepository.createAlert(alertData);

// Get summary with filters
const summary = await alertsRepository.getAlertSummary({
  org_unit_id: orgId,
  date_from: '2024-01-01',
  date_to: '2024-12-31',
});
```

## Alert Lifecycle

```
┌─────────┐
│  open   │ ←─ Alert created
└────┬────┘
     │
     ├─→ acknowledge() → ┌──────────────┐
     │                   │ acknowledged │
     │                   └──────┬───────┘
     │                          │
     ├─→ resolve() ─────────────┼─→ ┌──────────┐
     │                          │   │ resolved │
     │                          │   └──────────┘
     └─→ dismiss() ─────────────┴─→ ┌──────────┐
                                    │ dismissed│
                                    └──────────┘
```

## Deduplication

The system prevents duplicate alerts for the same entity and type:

- Alerts are checked before creation using `type`, `entity_type`, and `entity_id`
- Only one open/acknowledged alert per unique combination
- Returns existing alert instead of creating duplicate

## Testing

Run the integration test:

```bash
node test-alerts-system.js
```

This tests:
- Alert creation
- Listing and filtering
- Updates
- Acknowledgement and resolution
- Summary statistics
- Deduplication

## Integration Points

### With Dashboard
The dashboard queries alert statistics:

```javascript
const summary = await alertsService.getAlertSummary({ org_unit_id });
// Returns active_alerts count for dashboard
```

### With Assets
Low stock alerts are generated when:
- Asset quantity ≤ threshold
- Asset uses quantity tracking

### With Issues
Overdue loan alerts are generated when:
- Issue status is 'active' or 'dropped'
- Due date has passed

### With Notifications
Alerts can trigger notifications to relevant users (handled by notifications module).

## Best Practices

1. **Run background jobs regularly** - Hourly generation recommended
2. **Monitor critical alerts** - Set up dashboards for critical severity
3. **Auto-resolve when possible** - Reduces manual work
4. **Clean up old alerts** - Keep database performant
5. **Use deduplication** - Prevents alert spam
6. **Add context in metadata** - Store useful information for debugging

## Authorization

Alerts should be scoped by organization unit. Recommended permissions:

- **super_admin** - Full access to all alerts
- **org_admin** - Access to alerts in their org units
- **berm_incharge** - Access to alerts in their BERMs
- **auditor** - Read-only access
- **borrower** - Can view alerts related to their loans

(Implement authorization middleware according to your policy)

## Migration

Run the migration to create the alerts table:

```bash
npm run db:migrate
```

This creates:
- `alerts` table with all columns
- Indexes for performance
- Check constraints for valid enums
- Foreign keys to related tables

## Files Structure

```
src/modules/alerts/
├── alerts.schemas.js      # Zod validation schemas
├── alerts.repository.js   # Database queries
├── alerts.service.js      # Business logic
├── alerts.controller.js   # Request handlers
├── alerts.routes.js       # Route definitions
├── alert-jobs.js          # Background job utilities
├── index.js               # Module exports
└── README.md              # This file

migrations/
└── 005_alerts_table.js    # Database migration

test-alerts-system.js      # Integration tests
```

## Future Enhancements

- [ ] Email/SMS notifications for critical alerts
- [ ] Alert escalation rules
- [ ] Alert assignment to specific users
- [ ] Alert comments/discussion thread
- [ ] Webhook integration for external systems
- [ ] Machine learning for predictive alerts
- [ ] Custom alert templates
- [ ] Alert acknowledgement reminders
