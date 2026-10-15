// src/middleware/request-id.js
import crypto from 'node:crypto';
import logger from '../utils/logger.js';

/**
 * Middleware that assigns a unique request ID (or propagates an existing one)
 * and attaches a child logger scoped to that request ID.
 */
export function requestIdMiddleware(req, res, next) {
  const incomingId = req.headers['x-request-id'] || req.headers['x-correlation-id'];
  const requestId = (typeof incomingId === 'string' && incomingId.trim().length > 0)
    ? incomingId.trim()
    : crypto.randomUUID();

  req.id = requestId;
  req.log = logger.child({ requestId });

  res.setHeader('X-Request-Id', requestId);

  next();
}

export default requestIdMiddleware;

