// src/modules/alerts/alerts.routes.js
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import * as schemas from './alerts.schemas.js';
import * as controller from './alerts.controller.js';
import {
  assignAdminOrg,
  requireAdmin,
  requireReadAccess,
  requireScopedBodyResource,
  requireScopedResource,
  requireSuperAdmin,
} from '../../middleware/authorize.js';

const router = Router();
router.use(requireReadAccess);

// Special routes first (before /:id)
router.get('/summary', validate(schemas.alertSummarySchema, 'query'), controller.getAlertSummary);

// System/admin routes for alert generation
router.post('/generate', requireSuperAdmin, controller.generateSystemAlerts);
router.post('/auto-resolve', requireSuperAdmin, controller.autoResolveAlerts);

// CRUD routes
router.get('/', validate(schemas.listAlertsSchema, 'query'), controller.listAlerts);
router.post(
  '/',
  requireAdmin,
  validate(schemas.createAlertSchema, 'body'),
  assignAdminOrg('org_unit_id'),
  requireScopedBodyResource('asset', 'asset_id'),
  requireScopedBodyResource('issue', 'issue_id'),
  controller.createAlert
);
router.get('/:id', validate(schemas.alertIdSchema, 'params'), requireScopedResource('alert'), controller.getAlert);
router.patch(
  '/:id',
  requireAdmin,
  validate(schemas.alertIdSchema, 'params'),
  requireScopedResource('alert'),
  validate(schemas.updateAlertSchema, 'body'),
  controller.updateAlert
);

// Workflow routes
router.post(
  '/:id/acknowledge',
  validate(schemas.alertIdSchema, 'params'),
  requireScopedResource('alert'),
  validate(schemas.acknowledgeAlertSchema, 'body'),
  requireAdmin,
  controller.acknowledgeAlert
);
router.post(
  '/:id/resolve',
  validate(schemas.alertIdSchema, 'params'),
  requireScopedResource('alert'),
  validate(schemas.resolveAlertSchema, 'body'),
  requireAdmin,
  controller.resolveAlert
);
router.post(
  '/:id/dismiss',
  validate(schemas.alertIdSchema, 'params'),
  requireScopedResource('alert'),
  requireAdmin,
  controller.dismissAlert
);

export default router;
