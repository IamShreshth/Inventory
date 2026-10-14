import { pool } from './pool.js';

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
			console.error('Transaction rollback failed', rollbackError);
		}
		throw error;
	} finally {
		client.release();
	}
};
