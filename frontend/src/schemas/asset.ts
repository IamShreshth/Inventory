import { z } from 'zod';

export const assetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  description: z.string().optional(),
  asset_tag: z.string().min(1, 'Asset tag is required').max(100, 'Asset tag is too long'),
  tracking: z.enum(['individual', 'quantity']),
  quantity_total: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(1000000, 'Quantity is too large'),
  category_id: z.number().int().positive().optional(),
  location_id: z.number().int().positive().optional(),
  org_unit_id: z.number().int().positive().optional(),
  status: z.enum(['available', 'issued', 'maintenance', 'retired']).optional(),
  purchase_id: z.number().int().positive().optional(),
});

export type AssetFormData = z.infer<typeof assetSchema>;
