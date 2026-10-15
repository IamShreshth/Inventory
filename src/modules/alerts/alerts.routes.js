// src/modules/alerts/alerts.routes.js
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import * as schemas from './alerts.schemas.js';
import * as controller from './alerts.controller.js';

const router = Router();

// Special routes first (before /:id)
router.get('/summary', validate(schemas.alertSummarySchema, 'query'), controller.getAlertSummary);

// System/admin routes for alert generation
router.post('/generate', controller.generateSystemAlerts);
router.post('/auto-resolve', controller.autoResolveAlerts);

// CRUD routes
router.get('/', validate(schemas.listAlertsSchema, 'query'), controller.listAlerts);
router.post('/', validate(schemas.createAlertSchema, 'body'), controller.createAlert);
router.get('/:id', validate(schemas.alertIdSchema, 'params'), controller.getAlert);
router.patch(
  '/:id',
  validate(schemas.alertIdSchema, 'params'),
  validate(schemas.updateAlertSchema, 'body'),
  controller.updateAlert
);

// Workflow routes
router.post(
  '/:id/acknowledge',
  validate(schemas.alertIdSchema, 'params'),
  validate(schemas.acknowledgeAlertSchema, 'body'),
  controller.acknowledgeAlert
);
router.post(
  '/:id/resolve',
  validate(schemas.alertIdSchema, 'params'),
  validate(schemas.resolveAlertSchema, 'body'),
  controller.resolveAlert
);
router.post(
  '/:id/dismiss',
  validate(schemas.alertIdSchema, 'params'),
  controller.dismissAlert
);

export default router;
