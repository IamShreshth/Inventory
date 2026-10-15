// src/modules/borrower-blocks/borrower-blocks.routes.js
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import {
  createBlockSchema,
  updateBlockSchema,
  blockIdSchema,
  userIdSchema,
  listBlocksSchema,
} from './borrower-blocks.schemas.js';
import * as controller from './borrower-blocks.controller.js';

const router = Router();

// CRUD routes
router.get('/', validate(listBlocksSchema, 'query'), controller.listBorrowerBlocks);
router.post('/', validate(createBlockSchema, 'body'), controller.createBorrowerBlock);
router.get('/active/:userId', validate(userIdSchema, 'params'), controller.getActiveBlocksForUser);
router.get('/:id', validate(blockIdSchema, 'params'), controller.getBlockById);
router.patch('/:id', validate(blockIdSchema, 'params'), validate(updateBlockSchema, 'body'), controller.updateBorrowerBlock);
router.delete('/:id', validate(blockIdSchema, 'params'), controller.deleteBorrowerBlock);

export default router;