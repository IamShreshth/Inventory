// src/modules/users/users.service.js
import * as userRepository from './users.repository.js';
import bcrypt from 'bcryptjs';

export async function createUser(userData) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  return userRepository.createUser({
    ...userData,
    password_hash: hashedPassword,
  });
}

export const listUsers = userRepository.listUsers;
export const getUserById = userRepository.getUserById;
export const updateUser = userRepository.updateUser;
export const deactivateUser = userRepository.deactivateUser;