import * as service from './locations.service.js';
import { isAdmin, scopeOrgFilters } from '../../middleware/authorize.js';

export async function create(req, res, next) {
  try {
    const location = await service.create(req.validated.body);
    res.status(201).json({ data: location });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const location = await service.getById(req.validated.params.id);
    res.status(200).json({ data: location });
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const filters = isAdmin(req.user)
      ? scopeOrgFilters(req.user, req.validated.query)
      : req.validated.query;
    const result = await service.list(filters);
    res.status(200).json({ 
      data: result.items,
      meta: { pagination: result.pagination }
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const location = await service.update(req.validated.params.id, req.validated.body);
    res.status(200).json({ data: location });
  } catch (error) {
    next(error);
  }
}

export async function deleteById(req, res, next) {
  try {
    await service.deleteById(req.validated.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getChildren(req, res, next) {
  try {
    const children = await service.getChildren(req.validated.params.id);
    res.status(200).json({ data: children });
  } catch (error) {
    next(error);
  }
}
