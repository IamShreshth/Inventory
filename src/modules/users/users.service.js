// src/modules/users/users.service.js
import * as userRepository from './users.repository.js';
import argon2 from 'argon2';

export async function createUser(userData) {
  const hashedPassword = await argon2.hash(userData.password);
  return userRepository.createUser({
    ...userData,
    password_hash: hashedPassword,
  });
}

export const listUsers = userRepository.listUsers;
export const getUserById = userRepository.getUserById;
export const updateUser = userRepository.updateUser;
export const deactivateUser = userRepository.deactivateUser;