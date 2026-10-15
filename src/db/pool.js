import 'dotenv/config';
import pg from 'pg';
import logger from '../utils/logger.js';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is required');
}

export const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	max: Number(process.env.DB_POOL_MAX ?? 10),
	idleTimeoutMillis: 30_000,
	connectionTimeoutMillis: 5_000,
});

pool.on('error', (error) => {
	logger.error({ err: error }, 'Unexpected idle PostgreSQL client error');
});

export const checkDatabase = async () => {
	await pool.query('SELECT 1');
};
