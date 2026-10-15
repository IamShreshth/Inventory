import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { 
  createOrgUnitSchema, 
  updateOrgUnitSchema, 
  idSchema,
  listQuerySchema 
} from './org_units.schemas.js';
import * as controller from './org_units.controller.js';

const router = Router();

router.get('/', validate(listQuerySchema, 'query'), controller.list);
router.post('/', validate(createOrgUnitSchema, 'body'), controller.create);
router.get('/:id', validate(idSchema, 'params'), controller.getById);
router.patch('/:id', validate(idSchema, 'params'), validate(updateOrgUnitSchema, 'body'), controller.update);
router.delete('/:id', validate(idSchema, 'params'), controller.deleteById);
router.get('/:id/children', validate(idSchema, 'params'), controller.getChildren);

export default router;
