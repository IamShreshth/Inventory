import express from 'express';
import 'dotenv/config';

import authRoutes from './src/routes/auth.routes.js';
import authenticate from './src/middlewares/auth.middleware.js';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Mount routes with /api/v1 prefix as per api.md
app.use('/api/v1/auth', authRoutes);

// Example of a protected route using the middleware
app.get('/api/v1/users/me', authenticate, (req, res) => {
  res.status(200).json({ data: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});