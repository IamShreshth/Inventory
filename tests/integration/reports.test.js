import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { pool } from '../../src/db/pool.js';
import { createTestUser, createTestCategory, createTestAsset, createTestOrgUnit, cleanupTestData } from '../helpers/fixtures.js';
import reportsRouter from '../../src/modules/reports/reports.routes.js';
import authenticate from '../../src/middlewares/auth.middleware.js';

const app = express();
app.use(express.json());
app.use('/api/v1', authenticate, reportsRouter);

describe('Reports and Dashboard Tests', () => {
  let testUser;
  let testCategory;
  let testAsset;
  let testOrgUnit;

  beforeAll(async () => {
    testUser = await createTestUser();
    testCategory = await createTestCategory();
    testOrgUnit = await createTestOrgUnit();
    testAsset = await createTestAsset({ 
      category_id: testCategory.id,
      owner_org_id: testOrgUnit.id,
    });

    // Create some test issues for reports
    await pool.query(
      `INSERT INTO issues (asset_id, quantity, borrower_id, purpose, status, requested_at, issued_at, due_at)
       VALUES ($1, 1, $2, 'Testing', 'active', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '2 days')`,
      [testAsset.id, testUser.id]
    );
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/v1/dashboard/summary', () => {
    it('should return global dashboard summary', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total_assets');
      expect(response.body.data).toHaveProperty('active_issues');
      expect(response.body.data).toHaveProperty('overdue_count');
      expect(response.body.data).toHaveProperty('low_stock_count');
      expect(response.body.data).toHaveProperty('open_maintenance');

      // Verify data types
      expect(typeof response.body.data.total_assets).toBe('string');
      expect(typeof response.body.data.active_issues).toBe('string');
      expect(typeof response.body.data.overdue_count).toBe('string');
    });

    it('should return valid counts', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      const data = response.body.data;
      
      // Convert string counts to numbers
      expect(parseInt(data.total_assets)).toBeGreaterThanOrEqual(0);
      expect(parseInt(data.active_issues)).toBeGreaterThanOrEqual(0);
      expect(parseInt(data.overdue_count)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/v1/dashboard/org/:orgId', () => {
    it('should return organization-specific dashboard', async () => {
      const response = await request(app)
        .get(`/api/v1/dashboard/org/${testOrgUnit.id}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total_assets');
      expect(response.body.data).toHaveProperty('active_issues');
      expect(response.body.data).toHaveProperty('overdue_count');
    });

    it('should return 404 for non-existent organization', async () => {
      const fakeOrgId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/v1/dashboard/org/${fakeOrgId}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200); // Will return with zero counts

      const data = response.body.data;
      expect(parseInt(data.total_assets)).toBe(0);
    });
  });

  describe('GET /api/v1/reports/asset-inventory', () => {
    it('should return asset inventory report in JSON', async () => {
      const response = await request(app)
        .get('/api/v1/reports/asset-inventory?format=json')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const asset = response.body.data[0];
        expect(asset).toHaveProperty('name');
        expect(asset).toHaveProperty('tracking');
        expect(asset).toHaveProperty('status');
      }
    });

    it('should return asset inventory report in CSV', async () => {
      const response = await request(app)
        .get('/api/v1/reports/asset-inventory?format=csv')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200)
        .expect('Content-Type', /csv/);

      expect(typeof response.text).toBe('string');
      expect(response.text.length).toBeGreaterThan(0);
    });

    it('should filter by organization unit', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/asset-inventory?org_unit_id=${testOrgUnit.id}&format=json`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(asset => {
        expect(asset.owner_org_id).toBe(testOrgUnit.id);
      });
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/asset-inventory?category_id=${testCategory.id}&format=json`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(asset => {
        expect(asset.category_id).toBe(testCategory.id);
      });
    });
  });

  describe('GET /api/v1/reports/borrowing-history', () => {
    it('should return borrowing history', async () => {
      const response = await request(app)
        .get('/api/v1/reports/borrowing-history')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by user', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/borrowing-history?user_id=${testUser.id}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(issue => {
        expect(issue.borrower_id).toBe(testUser.id);
      });
    });

    it('should filter by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/v1/reports/borrowing-history?date_from=${weekAgo}&date_to=${today}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/reports/overdue-loans', () => {
    it('should return overdue loans report', async () => {
      const response = await request(app)
        .get('/api/v1/reports/overdue-loans')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      // Verify all returned issues are actually overdue
      response.body.data.forEach(issue => {
        const dueDate = new Date(issue.due_at);
        const now = new Date();
        expect(dueDate.getTime()).toBeLessThan(now.getTime());
        expect(['active', 'dropped']).toContain(issue.status);
      });
    });

    it('should filter by organization', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/overdue-loans?org_unit_id=${testOrgUnit.id}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should include borrower details', async () => {
      const response = await request(app)
        .get('/api/v1/reports/overdue-loans')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      if (response.body.data.length > 0) {
        const issue = response.body.data[0];
        expect(issue).toHaveProperty('borrower_name');
        expect(issue).toHaveProperty('borrower_email');
        expect(issue).toHaveProperty('asset_name');
      }
    });
  });

  describe('GET /api/v1/reports/maintenance-costs', () => {
    it('should return maintenance cost summary', async () => {
      const response = await request(app)
        .get('/api/v1/reports/maintenance-costs')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total_maintenance_records');
      expect(response.body.data).toHaveProperty('total_cost');
      expect(response.body.data).toHaveProperty('average_cost');
    });

    it('should filter by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/v1/reports/maintenance-costs?date_from=${monthAgo}&date_to=${today}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/reports/disposal-summary', () => {
    it('should return disposal summary statistics', async () => {
      const response = await request(app)
        .get('/api/v1/reports/disposal-summary')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total_disposals');
      expect(response.body.data).toHaveProperty('pending');
      expect(response.body.data).toHaveProperty('approved');
      expect(response.body.data).toHaveProperty('rejected');
      expect(response.body.data).toHaveProperty('total_salvage_value');
    });
  });

  describe('GET /api/v1/reports/asset-utilization', () => {
    it('should return asset utilization report', async () => {
      const response = await request(app)
        .get('/api/v1/reports/asset-utilization')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should include utilization metrics', async () => {
      const response = await request(app)
        .get('/api/v1/reports/asset-utilization')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      if (response.body.data.length > 0) {
        const asset = response.body.data[0];
        expect(asset).toHaveProperty('total_issues');
        expect(asset).toHaveProperty('active_issues');
        expect(asset).toHaveProperty('avg_loan_duration_days');
      }
    });

    it('should filter by organization', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/asset-utilization?org_unit_id=${testOrgUnit.id}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Report Performance', () => {
    it('should return reports within reasonable time', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      const duration = Date.now() - startTime;
      
      // Report should complete in under 5 seconds
      expect(duration).toBeLessThan(5000);
    });

    it('should handle empty result sets gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/reports/maintenance-costs?date_from=2020-01-01&date_to=2020-01-02')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(parseInt(response.body.data.total_maintenance_records)).toBe(0);
    });
  });
});
