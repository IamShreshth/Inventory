import * as service from './purchases.service.js';

export async function create(req, res, next) {
  try {
    const purchase = await service.create(req.validated.body, req.user.id);
    res.status(201).json({ data: purchase });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const purchase = await service.getById(req.validated.params.id);
    res.status(200).json({ data: purchase });
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
    const purchase = await service.update(req.validated.params.id, req.validated.body);
    res.status(200).json({ data: purchase });
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

export async function addItem(req, res, next) {
  try {
    const item = await service.addItem(req.validated.params.id, req.validated.body);
    res.status(201).json({ data: item });
  } catch (error) {
    next(error);
  }
}

export async function getItems(req, res, next) {
  try {
    const items = await service.getItems(req.validated.params.id);
    res.status(200).json({ data: items });
  } catch (error) {
    next(error);
  }
}

export async function updateItem(req, res, next) {
  try {
    const item = await service.updateItem(req.validated.params.itemId, req.validated.body);
    res.status(200).json({ data: item });
  } catch (error) {
    next(error);
  }
}

export async function deleteItem(req, res, next) {
  try {
    await service.deleteItem(req.validated.params.itemId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
