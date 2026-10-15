import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { 
  createPurchaseSchema, 
  updatePurchaseSchema, 
  addPurchaseItemSchema,
  updatePurchaseItemSchema,
  idSchema,
  itemIdSchema,
  listQuerySchema 
} from './purchases.schemas.js';
import * as controller from './purchases.controller.js';

const router = Router();

// Purchase routes
router.get('/', validate(listQuerySchema, 'query'), controller.list);
router.post('/', validate(createPurchaseSchema, 'body'), controller.create);
router.get('/:id', validate(idSchema, 'params'), controller.getById);
router.patch('/:id', validate(idSchema, 'params'), validate(updatePurchaseSchema, 'body'), controller.update);
router.delete('/:id', validate(idSchema, 'params'), controller.deleteById);

// Purchase items routes
router.get('/:id/items', validate(idSchema, 'params'), controller.getItems);
router.post('/:id/items', validate(idSchema, 'params'), validate(addPurchaseItemSchema, 'body'), controller.addItem);
router.patch('/:id/items/:itemId', validate(itemIdSchema, 'params'), validate(updatePurchaseItemSchema, 'body'), controller.updateItem);
router.delete('/:id/items/:itemId', validate(itemIdSchema, 'params'), controller.deleteItem);

export default router;
