export class AppError extends Error {
  constructor(code, message, statusCode = 500, details = []) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
