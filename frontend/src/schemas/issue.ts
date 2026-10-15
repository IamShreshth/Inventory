import { z } from 'zod';

export const issueRequestSchema = z.object({
  asset_id: z.number().int().positive('Please select an asset'),
  quantity_requested: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity is too large'),
  purpose: z.string().max(500, 'Purpose is too long').optional(),
});

export type IssueRequestFormData = z.infer<typeof issueRequestSchema>;

export const issueApproveSchema = z.object({
  due_date: z.string().optional(),
  notes: z.string().max(500, 'Notes are too long').optional(),
});

export type IssueApproveFormData = z.infer<typeof issueApproveSchema>;

export const issueCancelSchema = z.object({
  cancellation_reason: z.string().min(1, 'Reason is required').max(500, 'Reason is too long'),
});

export type IssueCancelFormData = z.infer<typeof issueCancelSchema>;

export const issueRenewSchema = z.object({
  new_due_date: z.string().min(1, 'New due date is required'),
  reason: z.string().max(500, 'Reason is too long').optional(),
});

export type IssueRenewFormData = z.infer<typeof issueRenewSchema>;
