// src/modules/users/users.controller.js
import * as userService from './users.service.js';
import { isAdmin, scopeOrgFilters } from '../../middleware/authorize.js';

export async function createUser(req, res, next) {
  try {
    const user = await userService.createUser(req.validated.body);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req, res, next) {
  try {
    const { page, limit, q } = req.validated.query;
    const filters = isAdmin(req.user)
      ? scopeOrgFilters(req.user, { limit, offset: (page - 1) * limit, q })
      : { limit, offset: (page - 1) * limit, q };
    const result = await userService.listUsers(filters);
    res.status(200).json({
      data: result.rows,
      meta: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await userService.getUserById(req.validated.params.id);
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found', details: [] } });
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await userService.updateUser(req.validated.params.id, req.validated.body);
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found', details: [] } });
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await userService.deactivateUser(req.validated.params.id);
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found', details: [] } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}