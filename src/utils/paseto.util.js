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
  const match = /^([0-9]+)([smhd])$/.exec(expiresIn);
  if (!match) {
    throw new Error('Invalid token expiry');
  }

  const units = { s: 1, m: 60, h: 3600, d: 86400 };
  const expiresAt = Date.now() + Number(match[1]) * units[match[2]] * 1000;
  const exp = new Date(expiresAt).toISOString();
  return await protocol.Encrypt(key, { ...payload, exp });
};

/**
 * Verifies and decrypts a PASETO token
 * @param {string} token - The PASETO token to verify
 * @returns {Promise<object>} - The decrypted payload
 */
export const verifyToken = async (token) => {
  const key = await getKey();
  const { claims } = await protocol.Decrypt(key, token);
  if (typeof claims.exp !== 'string' || Date.parse(claims.exp) <= Date.now()) {
    throw new Error('Token expired');
  }
  return claims;
};