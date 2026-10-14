import 'dotenv/config';

const required = ['DATABASE_URL'];

for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`${name} is required`);
  }
}

const port = Number(process.env.PORT ?? 3000);
const dbPoolMax = Number(process.env.DB_POOL_MAX ?? 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port');
}

if (!Number.isInteger(dbPoolMax) || dbPoolMax < 1) {
  throw new Error('DB_POOL_MAX must be a positive integer');
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port,
  databaseUrl: process.env.DATABASE_URL,
  dbPoolMax,
});
