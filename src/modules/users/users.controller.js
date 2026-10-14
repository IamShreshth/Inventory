// src/modules/users/users.controller.js
import * as userService from './users.service.js';

export async function createUser(req, res, next) {
  try {
    const user = await userService.createUser(req.validated.body);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
}