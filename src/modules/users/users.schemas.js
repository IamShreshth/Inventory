// src/modules/users/users.schemas.js
import { z } from 'zod';

export const createUserSchema = z.object({
  full_name: z.string().min(1),
  institute_email: z.string().email(),
  roll_no: z.string().min(1),
  phone: z.string().optional(),
  programme: z.string().optional(),
  password: z.string().min(8),
});