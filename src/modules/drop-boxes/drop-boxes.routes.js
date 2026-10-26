// src/modules/drop-boxes/drop-boxes.routes.js
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import {
  createDropBoxSchema,
  updateDropBoxSchema,
  dropBoxIdSchema,
  listDropBoxesSchema,
} from './drop-boxes.schemas.js';
import * as controller from './drop-boxes.controller.js';
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

// CRUD routes
router.get('/', validate(listDropBoxesSchema, 'query'), controller.listDropBoxes);
router.post('/', requireAdmin, validate(createDropBoxSchema, 'body'), assignAdminOrg('org_unit_id'), requireScopedBodyResource('location', 'location_id'), controller.createDropBox);
router.get('/:id', validate(dropBoxIdSchema, 'params'), requireScopedResource('dropbox'), controller.getDropBoxById);
router.patch('/:id', requireAdmin, validate(dropBoxIdSchema, 'params'), requireScopedResource('dropbox'), validate(updateDropBoxSchema, 'body'), requireAssignedOrg((req) => [req.validated.body.org_unit_id]), requireScopedBodyResource('location', 'location_id'), controller.updateDropBox);
router.delete('/:id', requireAdmin, validate(dropBoxIdSchema, 'params'), requireScopedResource('dropbox'), controller.deleteDropBox);

export default router;