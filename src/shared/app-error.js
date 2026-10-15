export class AppError extends Error {
  constructor(arg1, arg2, arg3 = 500, details = []) {
    let statusCode, code, message;
    if (typeof arg1 === 'number') {
      statusCode = arg1;
      code = arg2;
      message = arg3;
    } else {
      code = arg1;
      message = arg2;
      statusCode = typeof arg3 === 'number' ? arg3 : 500;
    }
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.status = statusCode;
    this.details = Array.isArray(details) ? details : [];
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
