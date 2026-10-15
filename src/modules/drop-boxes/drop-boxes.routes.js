// src/modules/drop-boxes/drop-boxes.routes.js
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import {
  createDropBoxSchema,
  updateDropBoxSchema,
  dropBoxIdSchema,
  listDropBoxesSchema,
} from './drop-boxes.schemas.js';
import * as controller from './drop-boxes.controller.js';

const router = Router();

// CRUD routes
router.get('/', validate(listDropBoxesSchema, 'query'), controller.listDropBoxes);
router.post('/', validate(createDropBoxSchema, 'body'), controller.createDropBox);
router.get('/:id', validate(dropBoxIdSchema, 'params'), controller.getDropBoxById);
router.patch('/:id', validate(dropBoxIdSchema, 'params'), validate(updateDropBoxSchema, 'body'), controller.updateDropBox);
router.delete('/:id', validate(dropBoxIdSchema, 'params'), controller.deleteDropBox);

export default router;