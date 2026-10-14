// src/modules/roles/roles.routes.js
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { createRoleSchema, updateRoleSchema, roleIdSchema } from './roles.schemas.js';
import * as controller from './roles.controller.js';

const router = Router({ mergeParams: true }); // mergeParams to access :id from parent router

router.get('/', controller.listUserRoles);
router.post('/', validate(createRoleSchema, 'body'), controller.createRole);
router.patch('/:roleId', validate(roleIdSchema, 'params'), validate(updateRoleSchema, 'body'), controller.updateRole);
router.delete('/:roleId', validate(roleIdSchema, 'params'), controller.deleteRole);

export default router;
