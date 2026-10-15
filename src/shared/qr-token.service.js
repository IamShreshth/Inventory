import crypto from 'crypto';
import { pool } from '../db/pool.js';
import { AppError } from './app-error.js';

/**
 * Generate a cryptographically secure QR token for an entity
 * @param {string} entityType - Type of entity (e.g., 'asset', 'drop_box')
 * @param {string} entityId - UUID of the entity
 * @returns {Promise<string>} The generated token (raw, not hashed)
 */
export async function generateToken(entityType, entityId) {
  // Generate a cryptographically secure random token
  const tokenBytes = crypto.randomBytes(32);
  const token = tokenBytes.toString('base64url');
  
  // Hash the token for storage
  const tokenHash = hashToken(token);
  
  // Check if an active token already exists for this entity
  const { rows: existing } = await pool.query(
    `SELECT id FROM qr_tokens 
     WHERE entity_type = $1 AND entity_id = $2 AND is_active = true`,
    [entityType, entityId]
  );
  
  if (existing.length > 0) {
    // Disable existing token(s)
    await pool.query(
      `UPDATE qr_tokens 
       SET is_active = false, disabled_at = now() 
       WHERE entity_type = $1 AND entity_id = $2 AND is_active = true`,
      [entityType, entityId]
    );
  }
  
  // Store the hashed token
  await pool.query(
    `INSERT INTO qr_tokens (token_hash, entity_type, entity_id, is_active)
     VALUES ($1, $2, $3, true)`,
    [tokenHash, entityType, entityId]
  );
  
  // Return the raw token (this is what gets encoded in the QR code)
  return token;
}

/**
 * Resolve a QR token to its associated entity
 * @param {string} token - The raw QR token
 * @returns {Promise<{entity_type: string, entity_id: string}|null>}
 */
export async function resolveToken(token) {
  // Hash the provided token
  const tokenHash = hashToken(token);
  
  // Look up the token
  const { rows } = await pool.query(
    `SELECT entity_type, entity_id, is_active, disabled_at
     FROM qr_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );
  
  if (rows.length === 0) {
    return null;
  }
  
  const tokenRecord = rows[0];
  
  // Check if token is active
  if (!tokenRecord.is_active) {
    throw new AppError('QR_TOKEN_DISABLED', 'This QR code has been disabled', 403);
  }
  
  return {
    entity_type: tokenRecord.entity_type,
    entity_id: tokenRecord.entity_id,
  };
}

/**
 * Disable a QR token for an entity
 * @param {string} entityType - Type of entity
 * @param {string} entityId - UUID of the entity
 */
export async function disableToken(entityType, entityId) {
  await pool.query(
    `UPDATE qr_tokens 
     SET is_active = false, disabled_at = now() 
     WHERE entity_type = $1 AND entity_id = $2 AND is_active = true`,
    [entityType, entityId]
  );
}

/**
 * Check if an entity has an active QR token
 * @param {string} entityType - Type of entity
 * @param {string} entityId - UUID of the entity
 * @returns {Promise<boolean>}
 */
export async function hasActiveToken(entityType, entityId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*) as count FROM qr_tokens 
     WHERE entity_type = $1 AND entity_id = $2 AND is_active = true`,
    [entityType, entityId]
  );
  
  return parseInt(rows[0].count) > 0;
}

/**
 * Get all tokens for an entity (including disabled ones)
 * @param {string} entityType - Type of entity
 * @param {string} entityId - UUID of the entity
 * @returns {Promise<Array>}
 */
export async function getEntityTokens(entityType, entityId) {
  const { rows } = await pool.query(
    `SELECT id, is_active, created_at, disabled_at
     FROM qr_tokens
     WHERE entity_type = $1 AND entity_id = $2
     ORDER BY created_at DESC`,
    [entityType, entityId]
  );
  
  return rows;
}

/**
 * Hash a token using SHA-256
 * @param {string} token - The raw token
 * @returns {string} The hexadecimal hash
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
