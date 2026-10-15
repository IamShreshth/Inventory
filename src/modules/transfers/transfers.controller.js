// src/modules/transfers/transfers.controller.js
import * as transfersService from './transfers.service.js';

export async function listTransfers(req, res, next) {
  try {
    const { page, limit, sort, ...filters } = req.validated.query;
    const offset = (page - 1) * limit;

    const result = await transfersService.listTransfers({ limit, offset, filters, sort });

    res.status(200).json({
      data: result.rows,
      meta: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTransfer(req, res, next) {
  try {
    const transfer = await transfersService.getTransferById(req.validated.params.id);
    res.status(200).json({ data: transfer });
  } catch (error) {
    next(error);
  }
}

export async function createTransfer(req, res, next) {
  try {
    const transfer = await transfersService.createTransfer(
      req.validated.body,
      req.user.id
    );
    res.status(201).json({ data: transfer });
  } catch (error) {
    next(error);
  }
}

export async function updateTransfer(req, res, next) {
  try {
    const transfer = await transfersService.updateTransfer(
      req.validated.params.id,
      req.validated.body
    );
    res.status(200).json({ data: transfer });
  } catch (error) {
    next(error);
  }
}

export async function approveTransfer(req, res, next) {
  try {
    const approvedBy = req.validated.body?.approved_by || req.user.id;
    const transfer = await transfersService.approveTransfer(
      req.validated.params.id,
      approvedBy
    );
    res.status(200).json({ data: transfer });
  } catch (error) {
    next(error);
  }
}

export async function rejectTransfer(req, res, next) {
  try {
    const rejectedBy = req.validated.body?.rejected_by || req.user.id;
    const transfer = await transfersService.rejectTransfer(
      req.validated.params.id,
      rejectedBy,
      req.validated.body.rejection_reason
    );
    res.status(200).json({ data: transfer });
  } catch (error) {
    next(error);
  }
}

export async function completeTransfer(req, res, next) {
  try {
    const completedBy = req.validated.body?.completed_by || req.user.id;
    const transfer = await transfersService.completeTransfer(
      req.validated.params.id,
      completedBy
    );
    res.status(200).json({ data: transfer });
  } catch (error) {
    next(error);
  }
}

export async function cancelTransfer(req, res, next) {
  try {
    const transfer = await transfersService.cancelTransfer(
      req.validated.params.id,
      req.user.id,
      req.validated.body.cancellation_reason
    );
    res.status(200).json({ data: transfer });
  } catch (error) {
    next(error);
  }
}
