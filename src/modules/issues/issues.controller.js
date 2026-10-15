// src/modules/issues/issues.controller.js
import * as issuesService from './issues.service.js';

export async function createIssue(req, res, next) {
  try {
    const issue = await issuesService.createIssue(req.validated.body, req.user.id);
    res.status(201).json({ data: issue });
  } catch (error) {
    next(error);
  }
}

export async function listIssues(req, res, next) {
  try {
    const { page, limit, ...filters } = req.validated.query;
    const offset = (page - 1) * limit;
    
    const result = await issuesService.listIssues({ limit, offset, filters });
    
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

export async function getIssue(req, res, next) {
  try {
    const issue = await issuesService.getIssueById(req.validated.params.id);
    res.status(200).json({ data: issue });
  } catch (error) {
    next(error);
  }
}

export async function updateIssue(req, res, next) {
  try {
    const issue = await issuesService.updateIssue(
      req.validated.params.id,
      req.validated.body
    );
    res.status(200).json({ data: issue });
  } catch (error) {
    next(error);
  }
}

export async function deleteIssue(req, res, next) {
  try {
    await issuesService.cancelIssue(
      req.validated.params.id,
      'Cancelled by user'
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function issueAsset(req, res, next) {
  try {
    const issuedBy = req.validated.body.issued_by || req.user.id;
    const issue = await issuesService.issueAsset(req.validated.params.id, issuedBy);
    res.status(200).json({ data: issue });
  } catch (error) {
    next(error);
  }
}

export async function dropIssue(req, res, next) {
  try {
    const issue = await issuesService.dropIssue(
      req.validated.params.id,
      req.validated.body.drop_box_id
    );
    res.status(200).json({ data: issue });
  } catch (error) {
    next(error);
  }
}

export async function receiveIssue(req, res, next) {
  try {
    const receivedBy = req.validated.body.received_by || req.user.id;
    const issue = await issuesService.receiveIssue(
      req.validated.params.id,
      req.validated.body,
      receivedBy
    );
    res.status(200).json({ data: issue });
  } catch (error) {
    next(error);
  }
}

export async function cancelIssue(req, res, next) {
  try {
    const issue = await issuesService.cancelIssue(
      req.validated.params.id,
      req.validated.body.cancellation_reason
    );
    res.status(200).json({ data: issue });
  } catch (error) {
    next(error);
  }
}

export async function renewIssue(req, res, next) {
  try {
    const result = await issuesService.renewIssue(
      req.validated.params.id,
      req.validated.body,
      req.user.id
    );
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function getOverdueIssues(req, res, next) {
  try {
    const issues = await issuesService.getOverdueIssues();
    res.status(200).json({ data: issues });
  } catch (error) {
    next(error);
  }
}

export async function getDroppedIssues(req, res, next) {
  try {
    const issues = await issuesService.getDroppedIssues();
    res.status(200).json({ data: issues });
  } catch (error) {
    next(error);
  }
}

export async function directReturnIssue(req, res, next) {
  try {
    const receivedBy = req.validated.body.received_by || req.user.id;
    const issue = await issuesService.directReturn(
      req.validated.params.id,
      req.validated.body,
      receivedBy
    );
    res.status(200).json({ data: issue });
  } catch (error) {
    next(error);
  }
}
