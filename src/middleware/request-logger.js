// src/middleware/request-logger.js
import logger from '../utils/logger.js';

/**
 * Middleware that logs HTTP requests upon completion with status, duration, and metadata.
 */
export function requestLogger(options = {}) {
  const ignorePaths = new Set(options.ignorePaths || []);
  const customLogger = options.logger || logger;

  return (req, res, next) => {
    const startTime = process.hrtime.bigint();
    const originalUrl = req.originalUrl || req.url;

    // Check if path is ignored (e.g. static assets)
    if (ignorePaths.has(originalUrl)) {
      return next();
    }

    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      const roundedDuration = Math.round(durationMs * 100) / 100;

      const log = req.log || customLogger;
      const statusCode = res.statusCode;

      const meta = {
        method: req.method,
        url: originalUrl,
        statusCode,
        durationMs: roundedDuration,
        requestId: req.id,
        userId: req.user?.id,
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
        userAgent: req.headers['user-agent'],
        contentLength: res.getHeader('content-length'),
      };

      const logMsg = `${req.method} ${originalUrl} ${statusCode} in ${roundedDuration}ms`;

      // Health endpoint can be logged at debug level to avoid log spam
      if (originalUrl === '/health' && statusCode < 400) {
        log.debug(meta, logMsg);
        return;
      }

      if (statusCode >= 500) {
        log.error(meta, logMsg);
      } else if (statusCode >= 400) {
        log.warn(meta, logMsg);
      } else {
        log.info(meta, logMsg);
      }
    });

    next();
  };
}

export default requestLogger;

