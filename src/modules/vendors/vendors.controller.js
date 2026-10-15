import * as service from './vendors.service.js';

export async function create(req, res, next) {
  try {
    const vendor = await service.create(req.validated.body);
    res.status(201).json({ data: vendor });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const vendor = await service.getById(req.validated.params.id);
    res.status(200).json({ data: vendor });
  } catch (error) {
    next(error);
  }
}

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

export async function update(req, res, next) {
  try {
    const vendor = await service.update(req.validated.params.id, req.validated.body);
    res.status(200).json({ data: vendor });
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
