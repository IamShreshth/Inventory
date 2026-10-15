import 'dotenv/config';
import { app } from './src/app.js';
import { checkDatabase } from './src/db/pool.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await checkDatabase();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exitCode = 1;
  }
};

startServer();

export { app };
export default app;