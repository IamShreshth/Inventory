// src/modules/roles/roles.controller.js
import * as rolesService from './roles.service.js';

export async function createRole(req, res, next) {
  try {
    const userId = req.params.id;
    const roleData = { ...req.validated.body, user_id: userId };
    
    const role = await rolesService.createRole(roleData);
    res.status(201).json({ data: role });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'User not found', details: [] },
      });
    }
    next(error);
  }
}

export async function listUserRoles(req, res, next) {
  try {
    const userId = req.params.id;
    const roles = await rolesService.getRolesByUserId(userId);
    res.status(200).json({ data: roles });
  } catch (error) {
    next(error);
  }
}

export async function updateRole(req, res, next) {
  try {
    const roleId = req.validated.params.roleId;
    const role = await rolesService.updateRole(roleId, req.validated.body);
    
    if (!role) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Role not found', details: [] },
      });
    }
    
    res.status(200).json({ data: role });
  } catch (error) {
    next(error);
  }
}

export async function deleteRole(req, res, next) {
  try {
    const roleId = req.validated.params.roleId;
    const role = await rolesService.deleteRole(roleId);
    
    if (!role) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Role not found', details: [] },
      });
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
