import { LocalProtocol } from 'paseto';
import { DecryptFactory, EncryptFactory, GenerateKeyFactory } from 'paseto/v3/local';
import 'dotenv/config';

const protocol = new LocalProtocol(GenerateKeyFactory, EncryptFactory, DecryptFactory);
let keyPromise;

const getKey = async () => {
  if (!keyPromise) {
    keyPromise = protocol.GenerateKey();
  }
  return await keyPromise;
};

/**
 * Generates a PASETO token
 * @param {object} payload - Data to encrypt in the token
 * @param {string} expiresIn - Expiration time (e.g., '15m', '7d')
 * @returns {Promise<string>} - The generated PASETO token
 */
export const generateToken = async (payload, expiresIn) => {
  const key = await getKey();
  return await protocol.Encrypt(key, payload);
};

/**
 * Verifies and decrypts a PASETO token
 * @param {string} token - The PASETO token to verify
 * @returns {Promise<object>} - The decrypted payload
 */
export const verifyToken = async (token) => {
  const key = await getKey();
  const { claims } = await protocol.Decrypt(key, token);
  return claims;
};