import express from 'express';
import 'dotenv/config';
import authRoutes from './src/routes/auth.routes.js';
import authenticate from './src/middlewares/auth.middleware.js';
import { checkDatabase } from './src/db/pool.js';
import usersRouter from './src/modules/users/users.routes.js';
import orgUnitsRouter from './src/modules/org_units/org_units.routes.js';
import categoriesRouter from './src/modules/categories/categories.routes.js';
import locationsRouter from './src/modules/locations/locations.routes.js';
import vendorsRouter from './src/modules/vendors/vendors.routes.js';
import purchasesRouter from './src/modules/purchases/purchases.routes.js';
import issuesRouter from './src/modules/issues/issues.routes.js';
import dropBoxesRouter from './src/modules/drop-boxes/drop-boxes.routes.js';
import borrowerBlocksRouter from './src/modules/borrower-blocks/borrower-blocks.routes.js';
import assetsRouter from './src/modules/assets/assets.routes.js';
import auditLogRouter from './src/modules/audit-log/audit-log.routes.js';
import reportsRouter from './src/modules/reports/reports.routes.js';
import alertsRouter from './src/modules/alerts/alerts.routes.js';
import { AppError } from './src/shared/app-error.js';

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
app.use('/api/v1/org-units', authenticate, orgUnitsRouter);
app.use('/api/v1/categories', authenticate, categoriesRouter);
app.use('/api/v1/locations', authenticate, locationsRouter);
app.use('/api/v1/vendors', authenticate, vendorsRouter);
app.use('/api/v1/purchases', authenticate, purchasesRouter);
app.use('/api/v1/assets', authenticate, assetsRouter);
app.use('/api/v1/issues', authenticate, issuesRouter);
app.use('/api/v1/drop-boxes', authenticate, dropBoxesRouter);
app.use('/api/v1/blocks', authenticate, borrowerBlocksRouter);
app.use('/api/v1/audit-log', authenticate, auditLogRouter);
app.use('/api/v1', authenticate, reportsRouter);
app.use('/api/v1/alerts', authenticate, alertsRouter);

// Global error fallback handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }
  
  // Handle other errors
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