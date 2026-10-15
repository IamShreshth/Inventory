// src/utils/logger.js
import util from 'node:util';

export const LOG_LEVELS = Object.freeze({
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
  silent: 100,
});

export const LEVEL_NAMES = Object.freeze({
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal',
});

const DEFAULT_SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'passwordconfirmation',
  'password_confirmation',
  'currentpassword',
  'current_password',
  'newpassword',
  'new_password',
  'oldpassword',
  'old_password',
  'token',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'resettoken',
  'reset_token',
  'qrtoken',
  'qr_token',
  'tokenhash',
  'token_hash',
  'secret',
  'apikey',
  'api_key',
  'privatekey',
  'private_key',
  'authorization',
  'cookie',
  'set-cookie',
  'database_url',
  'paseto_v3_local_key_base64',
]);

const ANSI_COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  grey: '\x1b[90m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  bgRed: '\x1b[41m\x1b[37m',
};

const LEVEL_COLORS = {
  trace: ANSI_COLORS.grey,
  debug: ANSI_COLORS.magenta,
  info: ANSI_COLORS.cyan,
  warn: ANSI_COLORS.yellow,
  error: ANSI_COLORS.red,
  fatal: ANSI_COLORS.bgRed,
};

/**
 * Recursively redacts sensitive values from an object or array.
 * Safe against circular references. Does not mutate the source.
 */
export function redactSensitive(data, sensitiveKeys = DEFAULT_SENSITIVE_KEYS, seen = new WeakSet()) {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  // Handle circular references
  if (seen.has(data)) {
    return '[Circular]';
  }
  seen.add(data);

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitive(item, sensitiveKeys, seen));
  }

  if (data instanceof Error) {
    return serializeError(data);
  }

  // Regular plain objects
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = key.toLowerCase().replace(/[-_]/g, '');
    const isSensitive =
      sensitiveKeys.has(key.toLowerCase()) ||
      sensitiveKeys.has(normalizedKey) ||
      key.toLowerCase().includes('password') ||
      key.toLowerCase().includes('secret');

    if (isSensitive) {
      if (typeof value === 'string' && key.toLowerCase() === 'authorization' && value.startsWith('Bearer ')) {
        result[key] = 'Bearer [REDACTED]';
      } else {
        result[key] = '[REDACTED]';
      }
    } else if (value !== null && typeof value === 'object') {
      result[key] = redactSensitive(value, sensitiveKeys, seen);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Serialize an Error object into a clean, loggable JSON structure.
 */
export function serializeError(err) {
  if (!err) return null;
  if (!(err instanceof Error)) {
    return { message: String(err) };
  }

  const serialized = {
    name: err.name,
    message: err.message,
    stack: err.stack,
  };

  if (err.code !== undefined) serialized.code = err.code;
  if (err.status !== undefined) serialized.status = err.status;
  if (err.statusCode !== undefined) serialized.statusCode = err.statusCode;
  if (err.details !== undefined) serialized.details = redactSensitive(err.details);

  // Copy any additional custom properties on the error
  for (const [key, value] of Object.entries(err)) {
    if (!(key in serialized)) {
      serialized[key] = typeof value === 'object' ? redactSensitive(value) : value;
    }
  }

  return serialized;
}

/**
 * Format a log entry as JSON (suitable for production log aggregators).
 */
function formatJson(entry) {
  return JSON.stringify(entry) + '\n';
}

/**
 * Format a log entry in a human-readable, colorized string for development.
 */
function formatPretty(entry) {
  const { level, time, msg, pid, err, ...rest } = entry;
  const color = LEVEL_COLORS[level] || ANSI_COLORS.reset;
  const reset = ANSI_COLORS.reset;
  const dim = ANSI_COLORS.dim;

  const dateStr = time ? new Date(time).toISOString().replace('T', ' ').replace('Z', '') : '';
  const levelBadge = `${color}${level.toUpperCase().padEnd(5)}${reset}`;
  const pidStr = pid ? `${dim}(${pid})${reset}` : '';
  const messageStr = msg ? ` ${msg}` : '';

  let extra = '';
  if (Object.keys(rest).length > 0) {
    extra = ` ${dim}${util.inspect(rest, { colors: true, depth: 4, breakLength: Infinity })}${reset}`;
  }

  let errStr = '';
  if (err) {
    if (err.stack) {
      errStr = `\n${ANSI_COLORS.red}${err.stack}${reset}`;
    } else {
      errStr = `\n${ANSI_COLORS.red}${err.name || 'Error'}: ${err.message}${reset}`;
    }
  }

  return `[${dateStr}] ${levelBadge} ${pidStr}${messageStr}${extra}${errStr}\n`;
}

/**
 * Logger class providing structured logging, log levels, sensitive redaction,
 * child loggers, and environment-aware formatting.
 */
export class Logger {
  constructor(options = {}) {
    this.name = options.name || 'app';
    this.bindings = options.bindings || {};
    this.destination = options.destination || {
      write(chunk) {
        process.stdout.write(chunk);
      },
    };

    // Determine log level
    const defaultLevel =
      process.env.LOG_LEVEL ||
      (process.env.NODE_ENV === 'test' ? 'silent' : 'info');
    this.setLevel(options.level || defaultLevel);

    // Determine format: 'json' or 'pretty'
    const defaultFormat =
      process.env.LOG_FORMAT ||
      (process.env.NODE_ENV === 'production' ? 'json' : 'pretty');
    this.format = options.format || defaultFormat;

    this.sensitiveKeys = options.sensitiveKeys || DEFAULT_SENSITIVE_KEYS;
    this.pid = options.pid !== undefined ? options.pid : process.pid;
  }

  setLevel(levelName) {
    const normalized = String(levelName).toLowerCase();
    if (LOG_LEVELS[normalized] === undefined) {
      throw new Error(`Invalid log level: "${levelName}". Valid levels: ${Object.keys(LOG_LEVELS).join(', ')}`);
    }
    this.level = normalized;
    this.levelVal = LOG_LEVELS[normalized];
  }

  getLevel() {
    return this.level;
  }

  isLevelEnabled(levelName) {
    const val = LOG_LEVELS[String(levelName).toLowerCase()];
    if (val === undefined) return false;
    return val >= this.levelVal;
  }

  /**
   * Create a child logger that inherits settings and includes additional bindings.
   */
  child(bindings = {}) {
    return new Logger({
      name: this.name,
      level: this.level,
      format: this.format,
      sensitiveKeys: this.sensitiveKeys,
      destination: this.destination,
      pid: this.pid,
      bindings: {
        ...this.bindings,
        ...bindings,
      },
    });
  }

  /**
   * Internal write method.
   */
  _log(levelName, firstArg, ...rest) {
    const levelVal = LOG_LEVELS[levelName];
    if (levelVal < this.levelVal) {
      return;
    }

    let msg = '';
    let context = {};
    let err = null;

    if (firstArg instanceof Error) {
      err = serializeError(firstArg);
      if (rest.length > 0) {
        msg = typeof rest[0] === 'string' ? util.format(rest[0], ...rest.slice(1)) : util.format(...rest);
      } else {
        msg = firstArg.message;
      }
    } else if (typeof firstArg === 'object' && firstArg !== null) {
      // If object has an `err` or `error` property that is an Error
      if (firstArg.err instanceof Error) {
        err = serializeError(firstArg.err);
        const { err: _e, ...otherFields } = firstArg;
        context = otherFields;
      } else if (firstArg.error instanceof Error) {
        err = serializeError(firstArg.error);
        const { error: _e, ...otherFields } = firstArg;
        context = otherFields;
      } else {
        context = { ...firstArg };
      }

      if (rest.length > 0) {
        msg = typeof rest[0] === 'string' ? util.format(rest[0], ...rest.slice(1)) : util.format(...rest);
      }
    } else if (typeof firstArg === 'string') {
      msg = rest.length > 0 ? util.format(firstArg, ...rest) : firstArg;
    } else if (firstArg !== undefined) {
      msg = util.format(firstArg, ...rest);
    }

    // Merge parent bindings and context, redacting sensitive fields
    const mergedData = redactSensitive({
      ...this.bindings,
      ...context,
    }, this.sensitiveKeys);

    const logEntry = {
      level: levelName,
      time: new Date().toISOString(),
      pid: this.pid,
      msg,
      ...mergedData,
    };

    if (err) {
      logEntry.err = err;
    }

    // Format output
    const output = this.format === 'json' ? formatJson(logEntry) : formatPretty(logEntry);
    this.destination.write(output);
  }

  trace(arg, ...rest) {
    this._log('trace', arg, ...rest);
  }

  debug(arg, ...rest) {
    this._log('debug', arg, ...rest);
  }

  info(arg, ...rest) {
    this._log('info', arg, ...rest);
  }

  warn(arg, ...rest) {
    this._log('warn', arg, ...rest);
  }

  error(arg, ...rest) {
    this._log('error', arg, ...rest);
  }

  fatal(arg, ...rest) {
    this._log('fatal', arg, ...rest);
  }
}

/**
 * Factory function to create custom logger instances.
 */
export function createLogger(options = {}) {
  return new Logger(options);
}

/**
 * Default application logger instance.
 */
export const logger = new Logger();

export default logger;

