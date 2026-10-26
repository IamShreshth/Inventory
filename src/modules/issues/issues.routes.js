// src/modules/issues/issues.routes.js
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import * as schemas from './issues.schemas.js';
import * as controller from './issues.controller.js';
import {
  requireAdmin,
  requireIssueOwner,
  requireReadAccess,
  requireRole,
  requireScopedBodyResource,
  requireScopedResource,
} from '../../middleware/authorize.js';

const router = Router();
router.use(requireReadAccess);

// Special routes first (before /:id)
router.get('/overdue', controller.getOverdueIssues);
router.get('/dropped', requireAdmin, controller.getDroppedIssues);

// CRUD routes
router.get('/', validate(schemas.listIssuesSchema, 'query'), controller.listIssues);
router.post('/', requireRole('super_admin', 'org_admin', 'berm_incharge', 'borrower'), validate(schemas.createIssueSchema, 'body'), requireScopedBodyResource('asset', 'asset_id'), controller.createIssue);
router.get('/:id', validate(schemas.issueIdSchema, 'params'), requireIssueOwner, requireScopedResource('issue'), controller.getIssue);
router.patch('/:id', requireAdmin, validate(schemas.issueIdSchema, 'params'), requireScopedResource('issue'), validate(schemas.updateIssueSchema, 'body'), controller.updateIssue);
router.delete('/:id', requireAdmin, validate(schemas.issueIdSchema, 'params'), requireScopedResource('issue'), controller.deleteIssue);

// Workflow routes
router.post('/:id/issue', requireAdmin, validate(schemas.issueIdSchema, 'params'), requireScopedResource('issue'), validate(schemas.issueAssetSchema, 'body'), controller.issueAsset);
router.post('/:id/drop', validate(schemas.issueIdSchema, 'params'), requireIssueOwner, validate(schemas.dropIssueSchema, 'body'), controller.dropIssue);
router.post('/:id/receive', requireAdmin, validate(schemas.issueIdSchema, 'params'), requireScopedResource('issue'), validate(schemas.receiveIssueSchema, 'body'), controller.receiveIssue);
router.post('/:id/return', validate(schemas.issueIdSchema, 'params'), requireIssueOwner, validate(schemas.receiveIssueSchema, 'body'), controller.directReturnIssue);
router.post('/:id/cancel', validate(schemas.issueIdSchema, 'params'), requireIssueOwner, validate(schemas.cancelIssueSchema, 'body'), controller.cancelIssue);
router.post('/:id/renew', validate(schemas.issueIdSchema, 'params'), requireIssueOwner, validate(schemas.renewIssueSchema, 'body'), controller.renewIssue);

export default router;
