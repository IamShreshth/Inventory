// src/modules/users/users.schemas.js
import { z } from 'zod';

export const createUserSchema = z.object({
  full_name: z.string().trim().min(1),
  institute_email: z.string().trim().email().transform((value) => value.toLowerCase()),
  roll_no: z.string().trim().min(1),
  phone: z.string().optional(),
  programme: z.string().optional(),
  password: z.string().min(8),
});

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
});

export const idSchema = z.object({ id: z.string().uuid() });

export const updateUserSchema = z.object({
  full_name: z.string().trim().min(1).optional(),
  phone: z.string().optional(),
  programme: z.string().optional(),
  is_active: z.boolean().optional(),
});