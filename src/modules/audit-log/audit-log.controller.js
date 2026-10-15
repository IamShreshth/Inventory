import * as service from './audit-log.service.js';

export async function list(req, res, next) {
  try {
    const result = await service.list(req.validated.query);
    res.status(200).json({ 
      data: result.items,
      meta: { pagination: result.pagination }
    });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const log = await service.getById(req.validated.params.id);
    res.status(200).json({ data: log });
  } catch (error) {
    next(error);
  }
}

export async function getByEntity(req, res, next) {
  try {
    const logs = await service.getByEntity(
      req.validated.params.entityType,
      req.validated.params.entityId
    );
    res.status(200).json({ data: logs });
  } catch (error) {
    next(error);
  }
}
