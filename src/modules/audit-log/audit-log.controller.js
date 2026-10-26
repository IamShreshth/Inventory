import * as service from './audit-log.service.js';
import { getAdminOrgIds, isAdmin } from '../../middleware/authorize.js';

export async function list(req, res, next) {
  try {
    const orgUnitIds = isAdmin(req.user) ? getAdminOrgIds(req.user) : null;
    const result = await service.list({ ...req.validated.query, org_unit_ids: orgUnitIds });
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
    const orgUnitIds = isAdmin(req.user) ? getAdminOrgIds(req.user) : null;
    const log = await service.getById(req.validated.params.id, orgUnitIds);
    res.status(200).json({ data: log });
  } catch (error) {
    next(error);
  }
}

export async function getByEntity(req, res, next) {
  try {
    const orgUnitIds = isAdmin(req.user) ? getAdminOrgIds(req.user) : null;
    const logs = await service.getByEntity(
      req.validated.params.entityType,
      req.validated.params.entityId,
      orgUnitIds
    );
    res.status(200).json({ data: logs });
  } catch (error) {
    next(error);
  }
}
