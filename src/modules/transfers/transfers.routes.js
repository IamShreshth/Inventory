// src/modules/transfers/transfers.routes.js
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import * as schemas from './transfers.schemas.js';
import * as controller from './transfers.controller.js';

const router = Router();

// CRUD routes
router.get('/', validate(schemas.listTransfersSchema, 'query'), controller.listTransfers);
router.post('/', validate(schemas.createTransferSchema, 'body'), controller.createTransfer);
router.get('/:id', validate(schemas.transferIdSchema, 'params'), controller.getTransfer);
router.patch(
  '/:id',
  validate(schemas.transferIdSchema, 'params'),
  validate(schemas.updateTransferSchema, 'body'),
  controller.updateTransfer
);

// Workflow routes
router.post(
  '/:id/approve',
  validate(schemas.transferIdSchema, 'params'),
  validate(schemas.approveTransferSchema, 'body'),
  controller.approveTransfer
);
router.post(
  '/:id/reject',
  validate(schemas.transferIdSchema, 'params'),
  validate(schemas.rejectTransferSchema, 'body'),
  controller.rejectTransfer
);
router.post(
  '/:id/complete',
  validate(schemas.transferIdSchema, 'params'),
  validate(schemas.completeTransferSchema, 'body'),
  controller.completeTransfer
);
router.post(
  '/:id/cancel',
  validate(schemas.transferIdSchema, 'params'),
  validate(schemas.cancelTransferSchema, 'body'),
  controller.cancelTransfer
);

export default router;
