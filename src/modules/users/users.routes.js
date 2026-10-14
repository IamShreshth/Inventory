// src/modules/users/users.routes.js
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { createUserSchema, idSchema, listUsersSchema, updateUserSchema } from './users.schemas.js';
import * as controller from './users.controller.js';

const router = Router();
router.get('/', validate(listUsersSchema, 'query'), controller.listUsers);
router.post('/', validate(createUserSchema, 'body'), controller.createUser);
router.get('/:id', validate(idSchema, 'params'), controller.getUser);
router.patch('/:id', validate(idSchema, 'params'), validate(updateUserSchema, 'body'), controller.updateUser);
router.delete('/:id', validate(idSchema, 'params'), controller.deleteUser);

export default router;
