// src/modules/drop-boxes/drop-boxes.controller.js
import * as dropBoxesService from './drop-boxes.service.js';

export async function createDropBox(req, res, next) {
  try {
    const dropBox = await dropBoxesService.createDropBox(req.validated.body);
    res.status(201).json({ data: dropBox });
  } catch (error) {
    next(error);
  }
}

export async function listDropBoxes(req, res, next) {
  try {
    const filters = req.validated.query || {};
    const result = await dropBoxesService.listDropBoxes({ filters });
    res.status(200).json({
      data: result.rows,
      meta: {
        total: result.total,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getDropBoxById(req, res, next) {
  try {
    const dropBox = await dropBoxesService.getDropBoxById(req.validated.params.id);
    if (!dropBox) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Drop box not found', details: [] },
      });
    }
    res.status(200).json({ data: dropBox });
  } catch (error) {
    next(error);
  }
}

export async function updateDropBox(req, res, next) {
  try {
    const dropBox = await dropBoxesService.updateDropBox(
      req.validated.params.id,
      req.validated.body
    );
    if (!dropBox) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Drop box not found', details: [] },
      });
    }
    res.status(200).json({ data: dropBox });
  } catch (error) {
    next(error);
  }
}

export async function deleteDropBox(req, res, next) {
  try {
    const dropBox = await dropBoxesService.deleteDropBox(req.validated.params.id);
    if (!dropBox) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Drop box not found', details: [] },
      });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}