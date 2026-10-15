import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { pool } from '../../src/db/pool.js';
import { createTestUser, createTestCategory, createTestAsset, cleanupTestData } from '../helpers/fixtures.js';
import assetsRouter from '../../src/modules/assets/assets.routes.js';
import authenticate from '../../src/middlewares/auth.middleware.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/assets', authenticate, assetsRouter);

describe('Assets Integration Tests', () => {
  let testUser;
  let testCategory;
  let testAsset;

  beforeAll(async () => {
    testUser = await createTestUser();
    testCategory = await createTestCategory();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/v1/assets', () => {
    it('should create a new asset with valid data', async () => {
      const assetData = {
        name: 'Test Arduino Board',
        category_id: testCategory.id,
        tracking: 'quantity',
        quantity: 5,
        low_stock_threshold: 1,
        condition: 'excellent',
        status: 'available',
        is_issuable: true,
        is_institute_asset: true,
      };

      const response = await request(app)
        .post('/api/v1/assets')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .send(assetData)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject({
        name: assetData.name,
        tracking: assetData.tracking,
        quantity: assetData.quantity,
      });

      testAsset = response.body.data;
    });

    it('should fail when creating asset with duplicate asset_tag', async () => {
      const asset1 = await createTestAsset({
        category_id: testCategory.id,
        asset_tag: 'UNIQUE-TAG-001',
      });

      const assetData = {
        name: 'Duplicate Tag Asset',
        category_id: testCategory.id,
        asset_tag: 'UNIQUE-TAG-001',
        tracking: 'quantity',
        quantity: 1,
        condition: 'good',
        status: 'available',
      };

      const response = await request(app)
        .post('/api/v1/assets')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .send(assetData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('ASSET_TAG_EXISTS');
    });

    it('should fail when creating individual tracked asset with quantity != 1', async () => {
      const assetData = {
        name: 'Invalid Individual Asset',
        category_id: testCategory.id,
        tracking: 'individual',
        quantity: 5, // Invalid for individual tracking
        condition: 'good',
        status: 'available',
      };

      const response = await request(app)
        .post('/api/v1/assets')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .send(assetData)
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_QUANTITY');
    });
  });

  describe('GET /api/v1/assets', () => {
    it('should list assets with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/assets?page=1&limit=10')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('pagination');
      expect(response.body.meta.pagination).toMatchObject({
        page: 1,
        limit: 10,
      });
    });

    it('should filter assets by status', async () => {
      const response = await request(app)
        .get('/api/v1/assets?status=available')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(asset => {
        expect(asset.status).toBe('available');
      });
    });

    it('should filter low stock assets', async () => {
      // Create a low stock asset
      await createTestAsset({
        category_id: testCategory.id,
        quantity: 1,
        low_stock_threshold: 5,
      });

      const response = await request(app)
        .get('/api/v1/assets?low_stock=true')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(asset => {
        expect(asset.quantity).toBeLessThanOrEqual(asset.low_stock_threshold);
      });
    });
  });

  describe('GET /api/v1/assets/:id', () => {
    it('should get asset by id', async () => {
      const asset = await createTestAsset({ category_id: testCategory.id });

      const response = await request(app)
        .get(`/api/v1/assets/${asset.id}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: asset.id,
        name: asset.name,
      });
    });

    it('should return 404 for non-existent asset', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/v1/assets/${fakeId}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(404);

      expect(response.body.error.code).toBe('ASSET_NOT_FOUND');
    });
  });

  describe('PATCH /api/v1/assets/:id', () => {
    it('should update asset', async () => {
      const asset = await createTestAsset({ category_id: testCategory.id });

      const updateData = {
        name: 'Updated Asset Name',
        quantity: 20,
      };

      const response = await request(app)
        .patch(`/api/v1/assets/${asset.id}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data).toMatchObject(updateData);
    });
  });

  describe('DELETE /api/v1/assets/:id', () => {
    it('should delete asset without dependencies', async () => {
      const asset = await createTestAsset({ category_id: testCategory.id });

      await request(app)
        .delete(`/api/v1/assets/${asset.id}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(204);
    });

    it('should fail to delete asset with active issues', async () => {
      const asset = await createTestAsset({ category_id: testCategory.id });

      // Create an active issue for the asset
      await pool.query(
        `INSERT INTO issues (asset_id, quantity, borrower_id, purpose, status)
         VALUES ($1, 1, $2, 'Testing', 'active')`,
        [asset.id, testUser.id]
      );

      const response = await request(app)
        .delete(`/api/v1/assets/${asset.id}`)
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(400);

      expect(response.body.error.code).toBe('ASSET_HAS_ACTIVE_ISSUES');
    });
  });

  describe('POST /api/v1/assets/batch-create', () => {
    it('should create multiple assets in batch', async () => {
      const assetsData = {
        assets: [
          {
            name: 'Batch Asset 1',
            category_id: testCategory.id,
            tracking: 'quantity',
            quantity: 5,
            condition: 'good',
            status: 'available',
          },
          {
            name: 'Batch Asset 2',
            category_id: testCategory.id,
            tracking: 'quantity',
            quantity: 3,
            condition: 'excellent',
            status: 'available',
          },
        ],
      };

      const response = await request(app)
        .post('/api/v1/assets/batch-create')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .send(assetsData)
        .expect(201);

      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/v1/assets/export', () => {
    it('should export assets as JSON', async () => {
      const response = await request(app)
        .get('/api/v1/assets/export?format=json')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should export assets as CSV', async () => {
      const response = await request(app)
        .get('/api/v1/assets/export?format=csv')
        .set('Authorization', `Bearer mock.token.${testUser.id}`)
        .expect(200)
        .expect('Content-Type', /csv/);

      expect(typeof response.text).toBe('string');
      expect(response.text).toContain('Asset Tag');
    });
  });
});
