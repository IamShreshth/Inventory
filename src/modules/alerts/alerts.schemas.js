// src/modules/alerts/alerts.schemas.js
import { z } from 'zod';

// Enums
const alertTypeEnum = z.enum([
  'low_stock',
  'overdue_loan',
  'warranty_expiry',
  'maintenance_due',
  'verification_pending',
  'asset_inactive',
  'disposal_pending',
  'transfer_pending',
  'system',
  'custom',
]);

const alertStatusEnum = z.enum(['open', 'acknowledged', 'resolved', 'dismissed']);

const alertSeverityEnum = z.enum(['low', 'medium', 'high', 'critical']);

const entityTypeEnum = z.enum([
  'asset',
  'issue',
  'purchase',
  'org_unit',
  'user',
  'verification_cycle',
  'transfer',
  'disposal',
  'maintenance',
]);

// Create alert schema (for system/admin use)
export const createAlertSchema = z.object({
  type: alertTypeEnum,
  severity: alertSeverityEnum.default('medium'),
  title: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(1000),
  entity_type: entityTypeEnum.optional(),
  entity_id: z.string().uuid().optional(),
  asset_id: z.string().uuid().optional(),
  issue_id: z.string().uuid().optional(),
  org_unit_id: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
});

// List alerts query schema
export const listAlertsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: alertTypeEnum.optional(),
  status: alertStatusEnum.optional(),
  severity: alertSeverityEnum.optional(),
  asset_id: z.string().uuid().optional(),
  issue_id: z.string().uuid().optional(),
  org_unit_id: z.string().uuid().optional(),
  entity_type: entityTypeEnum.optional(),
  entity_id: z.string().uuid().optional(),
  sort: z.string().optional(),
});

// Alert ID param schema
export const alertIdSchema = z.object({
  id: z.string().uuid(),
});

// Update alert schema
export const updateAlertSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  message: z.string().trim().min(1).max(1000).optional(),
  severity: alertSeverityEnum.optional(),
  status: alertStatusEnum.optional(),
  metadata: z.record(z.any()).optional(),
});

// Acknowledge alert schema
export const acknowledgeAlertSchema = z.object({
  acknowledged_by: z.string().uuid().optional(), // Optional: defaults to authenticated user
});

// Resolve alert schema
export const resolveAlertSchema = z.object({
  resolved_by: z.string().uuid().optional(), // Optional: defaults to authenticated user
  resolution_notes: z.string().trim().min(1).max(1000).optional(),
});

// Alert summary query schema
export const alertSummarySchema = z.object({
  org_unit_id: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
});
