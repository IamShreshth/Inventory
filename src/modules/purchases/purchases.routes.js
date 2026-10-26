import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { 
  createPurchaseSchema, 
  updatePurchaseSchema, 
  addPurchaseItemSchema,
  updatePurchaseItemSchema,
  idSchema,
  itemIdSchema,
  listQuerySchema 
} from './purchases.schemas.js';
import * as controller from './purchases.controller.js';
import {
  assignAdminOrg,
  requireAdmin,
  requireAssignedOrg,
  requireReadAccess,
  requireScopedResource,
} from '../../middleware/authorize.js';

const router = Router();
router.use(requireReadAccess);

// Purchase routes
router.get('/', validate(listQuerySchema, 'query'), controller.list);
router.post('/', requireAdmin, validate(createPurchaseSchema, 'body'), assignAdminOrg('org_unit_id'), controller.create);
router.get('/:id', validate(idSchema, 'params'), requireScopedResource('purchase'), controller.getById);
router.patch('/:id', requireAdmin, validate(idSchema, 'params'), requireScopedResource('purchase'), validate(updatePurchaseSchema, 'body'), requireAssignedOrg((req) => [req.validated.body.org_unit_id]), controller.update);
router.delete('/:id', requireAdmin, validate(idSchema, 'params'), requireScopedResource('purchase'), controller.deleteById);

// Purchase items routes
router.get('/:id/items', validate(idSchema, 'params'), requireScopedResource('purchase'), controller.getItems);
router.post('/:id/items', requireAdmin, validate(idSchema, 'params'), requireScopedResource('purchase'), validate(addPurchaseItemSchema, 'body'), controller.addItem);
router.patch('/:id/items/:itemId', requireAdmin, validate(itemIdSchema, 'params'), requireScopedResource('purchase'), validate(updatePurchaseItemSchema, 'body'), controller.updateItem);
router.delete('/:id/items/:itemId', requireAdmin, validate(itemIdSchema, 'params'), requireScopedResource('purchase'), controller.deleteItem);

export default router;
