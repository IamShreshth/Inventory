// src/middleware/error-handler.js
import logger from '../utils/logger.js';
import { AppError } from '../shared/app-error.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const isAppError = err instanceof AppError;

  const status = Number.isInteger(err.status)
    ? err.status
    : Number.isInteger(err.statusCode)
      ? err.statusCode
      : 500;

  const code =
    err.code ??
    (status >= 500 ? 'INTERNAL_SERVER_ERROR' : isAppError ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR');

  const message =
    status >= 500 && process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'An unexpected error occurred';

  const details =
    status >= 500 && process.env.NODE_ENV === 'production' ? [] : (err.details ?? []);

  const log = req?.log || logger;
  const meta = {
    requestId: req?.id,
    status,
    code,
    url: req?.originalUrl,
    method: req?.method,
    userId: req?.user?.id,
  };

  if (status >= 500) {
    log.error({ ...meta, err }, 'Unhandled server error');
  } else {
    log.warn({ ...meta, details }, err.message || 'Handled application error');
  }

  return res.status(status).json({
    error: { code, message, details },
  });
}

export default errorHandler;
