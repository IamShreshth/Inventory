import { z } from 'zod';

export const idSchema = z.object({
  id: z.string().uuid('Invalid audit log ID'),
});

export const entityParamsSchema = z.object({
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().uuid('Invalid entity ID'),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  table_name: z.string().optional(),
  record_id: z.string().uuid().optional(),
  action: z.enum(['create', 'update', 'delete']).optional(),
  changed_by: z.string().uuid().optional(),
  from_date: z.string().date().optional(),
  to_date: z.string().date().optional(),
});
