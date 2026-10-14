// src/modules/users/users.routes.js
import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { createUserSchema } from './users.schemas.js';
import { createUser } from './users.controller.js';

const router = Router();
router.post('/', validate(createUserSchema, 'body'), createUser);
// Add other endpoints (GET /users, GET /users/me, etc.)
export default router;
