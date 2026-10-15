import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  type: z.string().trim().min(1, 'Type is required'),
  building: z.string().trim().optional(),
  floor: z.string().trim().optional(),
  room_number: z.string().trim().optional(),
  description: z.string().trim().optional(),
  org_unit_id: z.string().uuid().optional(),
  parent_location_id: z.string().uuid().optional(),
  is_active: z.boolean().default(true),
});

export const updateLocationSchema = z.object({
  name: z.string().trim().min(1).optional(),
  type: z.string().trim().min(1).optional(),
  building: z.string().trim().nullable().optional(),
  floor: z.string().trim().nullable().optional(),
  room_number: z.string().trim().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  org_unit_id: z.string().uuid().nullable().optional(),
  parent_location_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().optional(),
});

export const idSchema = z.object({
  id: z.string().uuid(),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: z.string().optional(),
  building: z.string().optional(),
  org_unit_id: z.string().uuid().optional(),
  is_active: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
});
