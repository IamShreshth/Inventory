// src/modules/issues/issues.schemas.js
import { z } from 'zod';

const issueStatusEnum = z.enum(['requested', 'active', 'dropped', 'returned', 'cancelled']);

export const createIssueSchema = z.object({
  asset_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  borrower_id: z.string().uuid().optional(), // Optional: defaults to authenticated user
  on_behalf_of_org: z.string().uuid().optional(),
  purpose: z.string().trim().min(1).max(500).optional(),
});

export const listIssuesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: issueStatusEnum.optional(),
  borrower_id: z.string().uuid().optional(),
  asset_id: z.string().uuid().optional(),
  overdue: z.enum(['true', 'false']).optional(),
});

export const issueIdSchema = z.object({
  id: z.string().uuid(),
});

export const updateIssueSchema = z.object({
  quantity: z.number().int().positive().optional(),
  purpose: z.string().trim().min(1).max(500).optional(),
  on_behalf_of_org: z.string().uuid().optional(),
});

export const issueAssetSchema = z.object({
  issued_by: z.string().uuid().optional(), // Optional: defaults to authenticated user
});

export const dropIssueSchema = z.object({
  drop_box_id: z.string().uuid(),
});

export const receiveIssueSchema = z.object({
  received_by: z.string().uuid().optional(), // Optional: defaults to authenticated user
  return_condition: z.string().trim().min(1).max(200),
  remarks: z.string().trim().max(500).optional(),
});

export const cancelIssueSchema = z.object({
  cancellation_reason: z.string().trim().min(1).max(500),
});

export const renewIssueSchema = z.object({
  reason: z.string().trim().min(1).max(500).optional(),
  approved_by: z.string().uuid().optional(), // For auto-approval or admin approval
});
