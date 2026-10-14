// src/modules/users/users.service.js
import * as userRepository from './users.repository.js';
import { hash } from 'argon2';

export async function createUser(userData) {
  const hashedPassword = await hash(userData.password);
  return userRepository.createUser({
    ...userData,
    password_hash: hashedPassword,
  });
}