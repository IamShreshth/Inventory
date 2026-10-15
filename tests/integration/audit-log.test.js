import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { pool } from '../../src/db/pool.js';
import { createTestUser, createTestCategory, createTestAsset, cleanupTestData } from '../helpers/fixtures.js';
import auditLogRouter from '../../src/modules/audit-log/audit-log.routes.js';
import authenticate from '../../src/middlewares/auth.middleware.js';
import { createAuditLog } from '../../src/shared/audit.service.js';

const app = express();
app.use(express.json());
app.use('/api/v1/audit-log', authenticate, auditLogRouter);

describe('Audit Log Tests', () => {
  let testUser;
  let testCategory;
  let testAsset;

  beforeAll(async () => {
    testUser = await createTestUser();
    testCategory = await createTestCategory();
    testAsset = await createTestAsset({ category_id: testCategory.id });
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Audit Log Creation', () => {
    it('should create audit log entry', async () => {
      const auditData = {
        table_name: 'assets',
        record_id: testAsset.id,
        action: 'create',
        changed_by: testUser.id,
        new_data: {
          name: testAsset.name,
          status: testAsset.status,
        },
      };

      const auditEntry = await createAuditLog(auditData);

      expect(auditEntry).toBeDefined();
      expect(auditEntry.table_name).toBe('assets');
      expect(auditEntry.action).toBe('create');
    });

    it('should redact sensitive fields from audit logs', async () => {
      const auditData = {
        table_name: 'users',
        record_id: testUser.id,
        action: 'update',
        changed_by: testUser.id,
        old_data: {
          email: 'old@test.com',
          password_hash: 'should_be_redacted',
        },
        new_data: {
          email: 'new@test.com',
          password_hash: 'should_also_be_redacted',
        },
      };

      const auditEntry = await createAuditLog(auditData);

      const oldData = JSON.parse(auditEntry.old_data);
      const newData = JSON.parse(auditEntry.new_data);

      expect(oldData.password_hash).toBe('[REDACTED]');
      expect(newData.password_hash).toBe('[REDACTED]');
      expect(oldData.email).toBe('old@test.com');
      expect(newData.email).toBe('new@test.com');
    });
  });

  describe('GET /api/v1/audit-log', () => {
    it('should list audit logs with pagination', async () => {
      // Create some audit entries
      await createAuditLog({
        table_name: 'assets',
        record_id: testAsset.id,
        action: 'update',
        changed_by: testUser.id,
        new_data: { status: 'in_maintenance' },
      });

      const response = await request(app)
        .get('/api/v1/audit-log?page=1&limit=10')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta.pagination).toMatchObject({
        page: 1,
        limit: 10,
      });
    });

    it('should filter audit logs by table name', async () => {
      const response = await request(app)
        .get('/api/v1/audit-log?table_name=assets')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(entry => {
        expect(entry.table_name).toBe('assets');
      });
    });

    it('should filter audit logs by action', async () => {
      const response = await request(app)
        .get('/api/v1/audit-log?action=create')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(entry => {
        expect(entry.action).toBe('create');
      });
    });

    it('should filter audit logs by date range', async () => {
      const today = new Date().toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/v1/audit-log?from_date=${today}&to_date=${today}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/audit-log/:id', () => {
    it('should get specific audit log entry', async () => {
      const auditEntry = await createAuditLog({
        table_name: 'assets',
        record_id: testAsset.id,
        action: 'delete',
        changed_by: testUser.id,
      });

      const response = await request(app)
        .get(`/api/v1/audit-log/${auditEntry.id}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: auditEntry.id,
        table_name: 'assets',
        action: 'delete',
      });
    });

    it('should return 404 for non-existent audit log', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/v1/audit-log/${fakeId}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(404);

      expect(response.body.error.code).toBe('AUDIT_LOG_NOT_FOUND');
    });
  });

  describe('GET /api/v1/audit-log/entity/:entityType/:entityId', () => {
    it('should get audit history for specific entity', async () => {
      // Create multiple audit entries for the same asset
      await createAuditLog({
        table_name: 'assets',
        record_id: testAsset.id,
        action: 'update',
        changed_by: testUser.id,
        old_data: { status: 'available' },
        new_data: { status: 'in_maintenance' },
      });

      await createAuditLog({
        table_name: 'assets',
        record_id: testAsset.id,
        action: 'update',
        changed_by: testUser.id,
        old_data: { status: 'in_maintenance' },
        new_data: { status: 'available' },
      });

      const response = await request(app)
        .get(`/api/v1/audit-log/entity/assets/${testAsset.id}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      response.body.data.forEach(entry => {
        expect(entry.table_name).toBe('assets');
        expect(entry.record_id).toBe(testAsset.id);
      });
    });
  });

  describe('Audit Log Immutability', () => {
    it('should not allow modification of audit logs via API', async () => {
      // Audit log module should not have PATCH or DELETE endpoints
      const auditEntry = await createAuditLog({
        table_name: 'assets',
        record_id: testAsset.id,
        action: 'create',
        changed_by: testUser.id,
      });

      // Try to update (should fail or return 404)
      const updateResponse = await request(app)
        .patch(`/api/v1/audit-log/${auditEntry.id}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .send({ action: 'modified' });

      expect(updateResponse.status).toBeGreaterThanOrEqual(404);

      // Try to delete (should fail or return 404)
      const deleteResponse = await request(app)
        .delete(`/api/v1/audit-log/${auditEntry.id}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`);

      expect(deleteResponse.status).toBeGreaterThanOrEqual(404);
    });
  });
});
