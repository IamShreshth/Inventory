// src/modules/roles/roles.schemas.js
import { z } from 'zod';

const roleEnum = z.enum(['super_admin', 'org_admin', 'berm_incharge', 'borrower', 'auditor']);

export const createRoleSchema = z.object({
  org_unit_id: z.string().uuid().optional(),
  role: roleEnum,
  position_title: z.string().trim().optional(),
  academic_year: z.string().trim().optional(),
  term_start: z.string().date().optional(),
  term_end: z.string().date().optional(),
}).refine(
  (data) => !data.term_start || !data.term_end || data.term_start <= data.term_end,
  { message: 'term_end must be after or equal to term_start' }
);

export const updateRoleSchema = z.object({
  org_unit_id: z.string().uuid().optional(),
  role: roleEnum.optional(),
  position_title: z.string().trim().optional(),
  academic_year: z.string().trim().optional(),
  term_start: z.string().date().optional(),
  term_end: z.string().date().optional(),
}).refine(
  (data) => !data.term_start || !data.term_end || data.term_start <= data.term_end,
  { message: 'term_end must be after or equal to term_start' }
);

export const roleIdSchema = z.object({
  roleId: z.string().uuid(),
});

export const userIdSchema = z.object({
  id: z.string().uuid(),
});
