import { z } from 'zod';

// Org Units
export const orgUnitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  parent_id: z.number().int().positive().optional(),
});

export type OrgUnitSchemaData = z.infer<typeof orgUnitSchema>;

// Categories
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  parent_id: z.number().int().positive().optional(),
});

export type CategorySchemaData = z.infer<typeof categorySchema>;

// Locations
export const locationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
});

export type LocationSchemaData = z.infer<typeof locationSchema>;

// Vendors
export const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  contact_person: z.string().max(255, 'Contact person is too long').optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(50, 'Phone is too long').optional(),
  address: z.string().max(500, 'Address is too long').optional(),
});

export type VendorSchemaData = z.infer<typeof vendorSchema>;

// Purchases
export const purchaseSchema = z.object({
  vendor_id: z.number().int().positive().optional(),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  invoice_number: z.string().max(100, 'Invoice number is too long').optional(),
  total_amount: z
    .number()
    .min(0, 'Amount must be positive')
    .max(10000000, 'Amount is too large'),
  notes: z.string().max(1000, 'Notes are too long').optional(),
});

export type PurchaseSchemaData = z.infer<typeof purchaseSchema>;

// Users
export const userSchema = z.object({
  email: z.string().email('Invalid email'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username is too long'),
  full_name: z.string().min(1, 'Full name is required').max(255, 'Full name is too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  roles: z.array(z.enum(['super_admin', 'org_admin', 'berm_incharge', 'borrower', 'auditor'])).min(1, 'At least one role is required'),
});

export type UserSchemaData = z.infer<typeof userSchema>;

// Borrower Blocks
export const borrowerBlockSchema = z.object({
  borrower_id: z.number().int().positive('Please select a borrower'),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason is too long'),
});

export type BorrowerBlockSchemaData = z.infer<typeof borrowerBlockSchema>;

// Drop Boxes
export const dropBoxSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  location_id: z.number().int().positive().optional(),
  description: z.string().max(500, 'Description is too long').optional(),
  is_active: z.boolean(),
});

export type DropBoxSchemaData = z.infer<typeof dropBoxSchema>;
