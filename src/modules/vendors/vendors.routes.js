import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { 
  createVendorSchema, 
  updateVendorSchema, 
  idSchema,
  listQuerySchema 
} from './vendors.schemas.js';
import * as controller from './vendors.controller.js';

const router = Router();

router.get('/', validate(listQuerySchema, 'query'), controller.list);
router.post('/', validate(createVendorSchema, 'body'), controller.create);
router.get('/:id', validate(idSchema, 'params'), controller.getById);
router.patch('/:id', validate(idSchema, 'params'), validate(updateVendorSchema, 'body'), controller.update);
router.delete('/:id', validate(idSchema, 'params'), controller.deleteById);

export default router;
