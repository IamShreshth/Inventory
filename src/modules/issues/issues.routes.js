// src/modules/issues/issues.routes.js
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import * as schemas from './issues.schemas.js';
import * as controller from './issues.controller.js';

const router = Router();

// Special routes first (before /:id)
router.get('/overdue', controller.getOverdueIssues);
router.get('/dropped', controller.getDroppedIssues);

// CRUD routes
router.get('/', validate(schemas.listIssuesSchema, 'query'), controller.listIssues);
router.post('/', validate(schemas.createIssueSchema, 'body'), controller.createIssue);
router.get('/:id', validate(schemas.issueIdSchema, 'params'), controller.getIssue);
router.patch('/:id', validate(schemas.issueIdSchema, 'params'), validate(schemas.updateIssueSchema, 'body'), controller.updateIssue);
router.delete('/:id', validate(schemas.issueIdSchema, 'params'), controller.deleteIssue);

// Workflow routes
router.post('/:id/issue', validate(schemas.issueIdSchema, 'params'), validate(schemas.issueAssetSchema, 'body'), controller.issueAsset);
router.post('/:id/drop', validate(schemas.issueIdSchema, 'params'), validate(schemas.dropIssueSchema, 'body'), controller.dropIssue);
router.post('/:id/receive', validate(schemas.issueIdSchema, 'params'), validate(schemas.receiveIssueSchema, 'body'), controller.receiveIssue);
router.post('/:id/return', validate(schemas.issueIdSchema, 'params'), validate(schemas.receiveIssueSchema, 'body'), controller.directReturnIssue);
router.post('/:id/cancel', validate(schemas.issueIdSchema, 'params'), validate(schemas.cancelIssueSchema, 'body'), controller.cancelIssue);
router.post('/:id/renew', validate(schemas.issueIdSchema, 'params'), validate(schemas.renewIssueSchema, 'body'), controller.renewIssue);

export default router;
