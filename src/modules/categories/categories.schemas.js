import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  parent_id: z.string().uuid().optional(),
  default_low_stock_threshold: z.number().int().min(0).default(0),
  default_loan_days: z.number().int().min(1, 'Default loan days must be at least 1'),
  max_renewals: z.number().int().min(0).default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).optional(),
  parent_id: z.string().uuid().nullable().optional(),
  default_low_stock_threshold: z.number().int().min(0).optional(),
  default_loan_days: z.number().int().min(1).optional(),
  max_renewals: z.number().int().min(0).optional(),
});

export const idSchema = z.object({
  id: z.string().uuid(),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  parent_id: z.string().uuid().optional(),
  search: z.string().optional(),
});
