// src/modules/transfers/transfers.routes.js
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import * as schemas from './transfers.schemas.js';
import * as controller from './transfers.controller.js';
import {
  requireAdmin,
  requireAssignedOrg,
  requireReadAccess,
  requireScopedBodyResource,
  requireScopedResource,
} from '../../middleware/authorize.js';

const router = Router();
router.use(requireReadAccess);

// CRUD routes
router.get('/', validate(schemas.listTransfersSchema, 'query'), controller.listTransfers);
router.post(
  '/',
  requireAdmin,
  validate(schemas.createTransferSchema, 'body'),
  requireScopedBodyResource('asset', 'asset_id'),
  requireAssignedOrg((req) => [req.validated.body.from_org_id, req.validated.body.to_org_id]),
  controller.createTransfer
);
router.get('/:id', validate(schemas.transferIdSchema, 'params'), requireScopedResource('transfer'), controller.getTransfer);
router.patch(
  '/:id',
  requireAdmin,
  validate(schemas.transferIdSchema, 'params'),
  requireScopedResource('transfer'),
  validate(schemas.updateTransferSchema, 'body'),
  requireAssignedOrg((req) => [req.validated.body.from_org_id, req.validated.body.to_org_id]),
  controller.updateTransfer
);

// Workflow routes
router.post(
  '/:id/approve',
  requireAdmin,
  validate(schemas.transferIdSchema, 'params'),
  requireScopedResource('transfer'),
  validate(schemas.approveTransferSchema, 'body'),
  controller.approveTransfer
);
router.post(
  '/:id/reject',
  requireAdmin,
  validate(schemas.transferIdSchema, 'params'),
  requireScopedResource('transfer'),
  validate(schemas.rejectTransferSchema, 'body'),
  controller.rejectTransfer
);
router.post(
  '/:id/complete',
  requireAdmin,
  validate(schemas.transferIdSchema, 'params'),
  requireScopedResource('transfer'),
  validate(schemas.completeTransferSchema, 'body'),
  controller.completeTransfer
);
router.post(
  '/:id/cancel',
  requireAdmin,
  validate(schemas.transferIdSchema, 'params'),
  requireScopedResource('transfer'),
  validate(schemas.cancelTransferSchema, 'body'),
  controller.cancelTransfer
);

export default router;
