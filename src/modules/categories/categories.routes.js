import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { 
  createCategorySchema, 
  updateCategorySchema, 
  idSchema,
  listQuerySchema 
} from './categories.schemas.js';
import * as controller from './categories.controller.js';

const router = Router();

router.get('/', validate(listQuerySchema, 'query'), controller.list);
router.post('/', validate(createCategorySchema, 'body'), controller.create);
router.get('/:id', validate(idSchema, 'params'), controller.getById);
router.patch('/:id', validate(idSchema, 'params'), validate(updateCategorySchema, 'body'), controller.update);
router.delete('/:id', validate(idSchema, 'params'), controller.deleteById);
router.get('/:id/children', validate(idSchema, 'params'), controller.getChildren);

export default router;
