import express from 'express';
import authRoutes from './routes/auth.routes.js';
import authenticate from './middlewares/auth.middleware.js';
import { checkDatabase } from './db/pool.js';
import usersRouter from './modules/users/users.routes.js';
import orgUnitsRouter from './modules/org_units/org_units.routes.js';
import categoriesRouter from './modules/categories/categories.routes.js';
import locationsRouter from './modules/locations/locations.routes.js';
import vendorsRouter from './modules/vendors/vendors.routes.js';
import purchasesRouter from './modules/purchases/purchases.routes.js';
import assetsRouter from './modules/assets/assets.routes.js';
import issuesRouter from './modules/issues/issues.routes.js';
import dropBoxesRouter from './modules/drop-boxes/drop-boxes.routes.js';
import borrowerBlocksRouter from './modules/borrower-blocks/borrower-blocks.routes.js';
import auditLogRouter from './modules/audit-log/audit-log.routes.js';
import reportsRouter from './modules/reports/reports.routes.js';
import alertsRouter from './modules/alerts/alerts.routes.js';
import transfersRouter from './modules/transfers/transfers.routes.js';
import { AppError } from './shared/app-error.js';

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Log incoming requests in non-test environments
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

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

// Root route
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

// Mount resource routers
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
app.use('/api/v1/transfers', authenticate, transfersRouter);

// Global error fallback handler
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err.stack);
  }
  
  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode || err.status || 500).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details || [],
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

export { app };
export default app;