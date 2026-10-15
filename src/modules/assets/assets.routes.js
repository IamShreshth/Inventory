import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { 
  createAssetSchema, 
  updateAssetSchema, 
  batchCreateSchema,
  idSchema,
  qrTokenSchema,
  listQuerySchema,
  exportQuerySchema
} from './assets.schemas.js';
import * as controller from './assets.controller.js';

const router = Router();

// List and export
router.get('/', validate(listQuerySchema, 'query'), controller.list);
router.get('/export', validate(exportQuerySchema, 'query'), controller.exportAssets);

// QR token resolution
router.get('/qr/:qrToken', validate(qrTokenSchema, 'params'), controller.resolveQRToken);

// CRUD operations
router.post('/', validate(createAssetSchema, 'body'), controller.create);
router.post('/batch-create', validate(batchCreateSchema, 'body'), controller.batchCreate);
router.get('/:id', validate(idSchema, 'params'), controller.getById);
router.patch('/:id', validate(idSchema, 'params'), validate(updateAssetSchema, 'body'), controller.update);
router.delete('/:id', validate(idSchema, 'params'), controller.deleteById);

// QR token generation
router.post('/:id/qr', validate(idSchema, 'params'), controller.generateQRToken);

export default router;
