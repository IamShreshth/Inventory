// src/modules/users/users.routes.js
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { createUserSchema, idSchema, listUsersSchema, updateUserSchema } from './users.schemas.js';
import * as controller from './users.controller.js';
import rolesRouter from '../roles/roles.routes.js';
import {
  assignAdminOrg,
  requireAdmin,
  requireScopedResource,
} from '../../middleware/authorize.js';

const router = Router();
router.use(requireAdmin);
router.get('/', validate(listUsersSchema, 'query'), controller.listUsers);
router.post('/', validate(createUserSchema, 'body'), assignAdminOrg('org_unit_id'), controller.createUser);
router.get('/:id', validate(idSchema, 'params'), requireScopedResource('user'), controller.getUser);
router.patch('/:id', validate(idSchema, 'params'), requireScopedResource('user'), validate(updateUserSchema, 'body'), controller.updateUser);
router.delete('/:id', validate(idSchema, 'params'), requireScopedResource('user'), controller.deleteUser);

// Mount roles sub-routes under /users/:id/roles
router.use('/:id/roles', requireScopedResource('user'), rolesRouter);

export { router as usersRouter };
export default router;
