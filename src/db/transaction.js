import { pool } from './pool.js';
import logger from '../utils/logger.js';

export const withTransaction = async (work) => {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');
		const result = await work(client);
		await client.query('COMMIT');
		return result;
	} catch (error) {
		try {
			await client.query('ROLLBACK');
		} catch (rollbackError) {
			logger.error({ err: rollbackError }, 'Transaction rollback failed');
		}
		throw error;
	} finally {
		client.release();
	}
};
