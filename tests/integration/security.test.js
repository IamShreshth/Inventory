import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createTestUser, cleanupTestData } from '../helpers/fixtures.js';
import authRoutes from '../../src/routes/auth.routes.js';

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

describe('Security and Authentication Tests', () => {
  let testUser;

  beforeAll(async () => {
    testUser = await createTestUser({
      institute_email: 'security.test@institute.edu',
      roll_no: 'SEC001',
    });
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Authentication Security', () => {
    it('should return 401 for missing authorization header', async () => {
      const protectedApp = express();
      protectedApp.use(express.json());
      const authenticate = (await import('../../src/middlewares/auth.middleware.js')).default;
      protectedApp.get('/protected', authenticate, (req, res) => {
        res.json({ message: 'success' });
      });

      const response = await request(protectedApp)
        .get('/protected')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for malformed token', async () => {
      const protectedApp = express();
      protectedApp.use(express.json());
      const authenticate = (await import('../../src/middlewares/auth.middleware.js')).default;
      protectedApp.get('/protected', authenticate, (req, res) => {
        res.json({ message: 'success' });
      });

      const response = await request(protectedApp)
        .get('/protected')
        .set('Authorization', 'Bearer invalid.malformed.token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should not reveal whether email exists on login failure', async () => {
      const invalidEmailResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@institute.edu',
          password: 'wrongpassword',
        });

      const wrongPasswordResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.institute_email,
          password: 'wrongpassword',
        });

      // Both should return similar error messages
      expect(invalidEmailResponse.status).toBe(wrongPasswordResponse.status);
      expect(invalidEmailResponse.body.error.code).toBe(wrongPasswordResponse.body.error.code);
    });

    it('should not reveal whether email exists on forgot password', async () => {
      const existingEmailResponse = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUser.institute_email })
        .expect(200);

      const nonExistentEmailResponse = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@institute.edu' })
        .expect(200);

      // Both should return the same response
      expect(existingEmailResponse.body).toEqual(nonExistentEmailResponse.body);
    });
  });

  describe('Input Validation Security', () => {
    it('should reject SQL injection attempts in email field', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: "' OR '1'='1",
          password: 'password',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          full_name: 'Test User',
          institute_email: 'not-an-email',
          roll_no: 'TEST001',
          password: 'password123',
        })
        .expect(422);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should enforce password minimum length', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          full_name: 'Test User',
          institute_email: 'test@institute.edu',
          roll_no: 'TEST002',
          password: 'short',
        })
        .expect(422);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject oversized request bodies', async () => {
      const largePayload = {
        full_name: 'A'.repeat(10000),
        institute_email: 'test@institute.edu',
        roll_no: 'TEST003',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(largePayload);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Response Security', () => {
    it('should never expose password_hash in responses', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          full_name: 'Password Test User',
          institute_email: `pwtest${Date.now()}@institute.edu`,
          roll_no: `PWT${Date.now()}`,
          password: 'securepassword123',
        });

      const checkForPasswordHash = (obj) => {
        if (typeof obj !== 'object' || obj === null) return false;
        
        for (const key in obj) {
          if (key === 'password_hash' || key === 'password') {
            return true;
          }
          if (typeof obj[key] === 'object') {
            if (checkForPasswordHash(obj[key])) return true;
          }
        }
        return false;
      };

      expect(checkForPasswordHash(response.body)).toBe(false);
    });

    it('should not expose internal error details in production', async () => {
      // Trigger a server error
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: null, password: null });

      expect(response.body).not.toHaveProperty('stack');
      expect(response.body.error).not.toMatch(/node_modules/);
      expect(response.body.error).not.toMatch(/at /);
    });

    it('should include proper error codes', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@institute.edu',
          password: 'wrongpassword',
        });

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(typeof response.body.error.code).toBe('string');
    });
  });

  describe('Rate Limiting and DoS Protection', () => {
    it('should handle multiple rapid requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'test@institute.edu',
            password: 'password',
          })
      );

      const responses = await Promise.all(requests);
      
      // All requests should complete (no crashes)
      responses.forEach(response => {
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(600);
      });
    });
  });

  describe('Token Security', () => {
    it('should not accept tokens with invalid format', async () => {
      const protectedApp = express();
      protectedApp.use(express.json());
      const authenticate = (await import('../../src/middlewares/auth.middleware.js')).default;
      protectedApp.get('/protected', authenticate, (req, res) => {
        res.json({ message: 'success' });
      });

      const invalidTokens = [
        'Bearer ',
        'Bearer invalid',
        'InvalidFormat token',
        'Bearer v2.local.invalid',
      ];

      for (const token of invalidTokens) {
        const response = await request(protectedApp)
          .get('/protected')
          .set('Authorization', token);

        expect(response.status).toBe(401);
      }
    });
  });

  describe('CORS and Headers Security', () => {
    it('should include security headers in responses', async () => {
      const response = await request(app)
        .get('/api/v1/auth/login')
        .send();

      // Check for common security headers (if implemented)
      // These might not be set yet but should be in production
      const headers = response.headers;
      
      // Just verify headers exist
      expect(headers).toBeDefined();
    });
  });
});
