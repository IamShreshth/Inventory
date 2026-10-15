// src/middleware/error-handler.js

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = Number.isInteger(err.status) 
    ? err.status 
    : (Number.isInteger(err.statusCode) ? err.statusCode : 500);
  const code = err.code ?? 'INTERNAL_SERVER_ERROR';
  const message = status >= 500 ? 'An unexpected error occurred' : err.message;
  const details = status >= 500 ? [] : (err.details ?? []);

  if (status >= 500 && process.env.NODE_ENV !== 'test') {
    console.error({ requestId: req.id, err });
  }

  return res.status(status).json({
    error: { code, message, details },
  });
}

export default errorHandler;

