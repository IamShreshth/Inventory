// src/modules/drop-boxes/drop-boxes.schemas.js
import { z } from 'zod';

export const createDropBoxSchema = z.object({
  name: z.string().trim().min(1),
  location_id: z.string().uuid(),
  org_unit_id: z.string().uuid().optional(),
  qr_token_hash: z.string().optional(),
  description: z.string().trim().optional(),
  is_active: z.boolean().optional(),
});

export const updateDropBoxSchema = z.object({
  name: z.string().trim().min(1).optional(),
  location_id: z.string().uuid().optional(),
  org_unit_id: z.string().uuid().optional(),
  qr_token_hash: z.string().optional(),
  description: z.string().trim().optional(),
  is_active: z.boolean().optional(),
});

export const dropBoxIdSchema = z.object({
  id: z.string().uuid(),
});

export const locationIdSchema = z.object({
  id: z.string().uuid(),
});

export const listDropBoxesSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  location_id: z.string().uuid().optional(),
  org_unit_id: z.string().uuid().optional(),
  is_active: z.enum(['true', 'false']).optional(),
});