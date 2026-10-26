import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { 
  idSchema,
  entityParamsSchema,
  listQuerySchema 
} from './audit-log.schemas.js';
import * as controller from './audit-log.controller.js';
import { requireRole } from '../../middleware/authorize.js';

const router = Router();
router.use(requireRole('super_admin', 'org_admin', 'berm_incharge', 'auditor'));

// List audit logs
router.get('/', validate(listQuerySchema, 'query'), controller.list);

// Get single audit log entry
router.get('/:id', validate(idSchema, 'params'), controller.getById);

// Get audit logs for specific entity (must be after /:id to avoid conflicts)
router.get('/entity/:entityType/:entityId', validate(entityParamsSchema, 'params'), controller.getByEntity);

export default router;
