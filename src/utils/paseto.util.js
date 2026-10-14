const { V4: pasetoV4 } = require('paseto');
require('dotenv').config();

const secretKey = Buffer.from(process.env.PASETO_SECRET_KEY, 'hex');

/**
 * Generates a PASETO token
 * @param {object} payload - Data to encrypt in the token
 * @param {string} expiresIn - Expiration time (e.g., '15m', '7d')
 * @returns {Promise<string>} - The generated PASETO token
 */
const generateToken = async (payload, expiresIn) => {
  return await pasetoV4.encrypt(payload, secretKey, { expiresIn });
};

/**
 * Verifies and decrypts a PASETO token
 * @param {string} token - The PASETO token to verify
 * @returns {Promise<object>} - The decrypted payload
 */
const verifyToken = async (token) => {
  return await pasetoV4.decrypt(token, secretKey);
};

module.exports = {
  generateToken,
  verifyToken,
};