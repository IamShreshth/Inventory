// src/modules/roles/roles.service.js
import * as rolesRepository from './roles.repository.js';
import * as usersRepository from '../users/users.repository.js';

export async function createRole(roleData) {
  // Verify user exists
  const user = await usersRepository.getUserById(roleData.user_id);
  if (!user) {
    throw new Error('User not found');
  }

  // If org_unit_id is provided, verify it exists
  if (roleData.org_unit_id) {
    // For now, we'll skip org validation since org_units might not be implemented yet
    // TODO: Add org_unit validation when org_units module is complete
  }

  return rolesRepository.createRole(roleData);
}

export async function getRolesByUserId(userId) {
  return rolesRepository.getRolesByUserId(userId);
}

export async function getRoleById(roleId) {
  return rolesRepository.getRoleById(roleId);
}

export async function updateRole(roleId, fields) {
  const role = await rolesRepository.getRoleById(roleId);
  if (!role) {
    return null;
  }
  return rolesRepository.updateRole(roleId, fields);
}

export async function deleteRole(roleId) {
  const role = await rolesRepository.getRoleById(roleId);
  if (!role) {
    return null;
  }
  return rolesRepository.deleteRole(roleId);
}

export async function getActiveRolesForUser(userId) {
  return rolesRepository.getActiveRolesForUser(userId);
}
