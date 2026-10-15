// src/middleware/not-found.js
import { AppError } from '../shared/app-error.js';

export function notFoundHandler(req, res, next) {
  next(new AppError(404, 'NOT_FOUND', `Cannot ${req.method} ${req.originalUrl || req.url}`));
}

export default notFoundHandler;

