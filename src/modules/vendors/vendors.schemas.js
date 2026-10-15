import { z } from 'zod';

export const createVendorSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  code: z.string().trim().min(1, 'Code is required'),
  contact_person: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  gstin: z.string().trim().optional(),
  pan: z.string().trim().optional(),
  website: z.string().trim().url().optional(),
  notes: z.string().trim().optional(),
  is_active: z.boolean().default(true),
});

export const updateVendorSchema = z.object({
  name: z.string().trim().min(1).optional(),
  code: z.string().trim().min(1).optional(),
  contact_person: z.string().trim().nullable().optional(),
  email: z.string().trim().email().nullable().optional(),
  phone: z.string().trim().nullable().optional(),
  address: z.string().trim().nullable().optional(),
  city: z.string().trim().nullable().optional(),
  state: z.string().trim().nullable().optional(),
  country: z.string().trim().nullable().optional(),
  pincode: z.string().trim().nullable().optional(),
  gstin: z.string().trim().nullable().optional(),
  pan: z.string().trim().nullable().optional(),
  website: z.string().trim().url().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  is_active: z.boolean().optional(),
});

export const idSchema = z.object({
  id: z.string().uuid(),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  is_active: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
});
