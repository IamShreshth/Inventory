import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { 
  idSchema,
  entityParamsSchema,
  listQuerySchema 
} from './audit-log.schemas.js';
import * as controller from './audit-log.controller.js';

const router = Router();

// List audit logs
router.get('/', validate(listQuerySchema, 'query'), controller.list);

// Get single audit log entry
router.get('/:id', validate(idSchema, 'params'), controller.getById);

// Get audit logs for specific entity (must be after /:id to avoid conflicts)
router.get('/entity/:entityType/:entityId', validate(entityParamsSchema, 'params'), controller.getByEntity);

export default router;
