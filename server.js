import express from 'express';
import 'dotenv/config';
import authRoutes from './src/routes/auth.routes.js';
import authenticate from './src/middlewares/auth.middleware.js';
import { checkDatabase } from './src/db/pool.js';
import usersRouter from './src/modules/users/users.routes.js';

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Log every incoming request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health endpoint (no authentication required)
app.get('/health', async (req, res) => {
  try {
    await checkDatabase();
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'berm-inventory-api',
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'berm-inventory-api',
      database: 'disconnected',
    });
  }
});

// Root route to handle GET / at localhost:3000
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the API server',
  });
});

// Mount authentication routes under /api/v1/auth
app.use('/api/v1/auth', authRoutes);

// Protected /users/me route (must come before /api/v1/users to avoid conflict)
app.get('/api/v1/users/me', authenticate, (req, res) => {
  res.status(200).json({ data: req.user });
});

app.use('/api/v1/users', authenticate, usersRouter);

// Global error fallback handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong on the server.',
      details: [],
    },
  });
});

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