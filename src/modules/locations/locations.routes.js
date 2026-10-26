import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { 
  createLocationSchema, 
  updateLocationSchema, 
  idSchema,
  listQuerySchema 
} from './locations.schemas.js';
import * as controller from './locations.controller.js';
import {
  assignAdminOrg,
  requireAdmin,
  requireAssignedOrg,
  requireReadAccess,
  requireScopedBodyResource,
  requireScopedResource,
} from '../../middleware/authorize.js';

const router = Router();
router.use(requireReadAccess);

router.get('/', validate(listQuerySchema, 'query'), controller.list);
router.post('/', requireAdmin, validate(createLocationSchema, 'body'), assignAdminOrg('org_unit_id'), requireScopedBodyResource('location', 'parent_location_id'), controller.create);
router.get('/:id', validate(idSchema, 'params'), requireScopedResource('location'), controller.getById);
router.patch('/:id', requireAdmin, validate(idSchema, 'params'), requireScopedResource('location'), validate(updateLocationSchema, 'body'), requireAssignedOrg((req) => [req.validated.body.org_unit_id]), requireScopedBodyResource('location', 'parent_location_id'), controller.update);
router.delete('/:id', requireAdmin, validate(idSchema, 'params'), requireScopedResource('location'), controller.deleteById);
router.get('/:id/children', validate(idSchema, 'params'), requireScopedResource('location'), controller.getChildren);

export default router;
