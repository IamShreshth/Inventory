import express from 'express';
import 'dotenv/config';
import authRoutes from './src/routes/auth.routes.js';
import authenticate from './src/middlewares/auth.middleware.js';
import { checkDatabase } from './src/db/pool.js';

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Log every incoming request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root route to handle GET / at localhost:3000
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the API server',
  });
});

// Mount authentication routes under /api/v1/auth[cite: 3]
app.use('/api/v1/auth', authRoutes);

// Example of a protected route using the authentication middleware[cite: 2]
app.get('/api/v1/users/me', authenticate, (req, res) => {
  res.status(200).json({ data: req.user });
});

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