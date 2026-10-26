// src/modules/alerts/alerts.controller.js
import * as alertsService from './alerts.service.js';
import { isAdmin, scopeOrgFilters } from '../../middleware/authorize.js';

/**
 * List alerts with filters and pagination
 * GET /api/v1/alerts
 */
export async function listAlerts(req, res, next) {
  try {
    const { page, limit, sort, ...filters } = req.validated.query;
    const offset = (page - 1) * limit;

    const scopedFilters = isAdmin(req.user) ? scopeOrgFilters(req.user, filters) : filters;
    const result = await alertsService.listAlerts({ limit, offset, filters: scopedFilters, sort });

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

/**
 * Get alert by ID
 * GET /api/v1/alerts/:id
 */
export async function getAlert(req, res, next) {
  try {
    const alert = await alertsService.getAlertById(req.validated.params.id);
    res.status(200).json({ data: alert });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new alert (system/admin use)
 * POST /api/v1/alerts
 */
export async function createAlert(req, res, next) {
  try {
    const alert = await alertsService.createAlert(req.validated.body);
    res.status(201).json({ data: alert });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an alert
 * PATCH /api/v1/alerts/:id
 */
export async function updateAlert(req, res, next) {
  try {
    const alert = await alertsService.updateAlert(
      req.validated.params.id,
      req.validated.body
    );
    res.status(200).json({ data: alert });
  } catch (error) {
    next(error);
  }
}

/**
 * Acknowledge an alert
 * POST /api/v1/alerts/:id/acknowledge
 */
export async function acknowledgeAlert(req, res, next) {
  try {
    const userId = req.validated.body?.acknowledged_by || req.user.id;
    const alert = await alertsService.acknowledgeAlert(req.validated.params.id, userId);
    res.status(200).json({ data: alert });
  } catch (error) {
    next(error);
  }
}

/**
 * Resolve an alert
 * POST /api/v1/alerts/:id/resolve
 */
export async function resolveAlert(req, res, next) {
  try {
    const userId = req.validated.body?.resolved_by || req.user.id;
    const resolutionNotes = req.validated.body?.resolution_notes;
    const alert = await alertsService.resolveAlert(
      req.validated.params.id,
      userId,
      resolutionNotes
    );
    res.status(200).json({ data: alert });
  } catch (error) {
    next(error);
  }
}

/**
 * Dismiss an alert
 * POST /api/v1/alerts/:id/dismiss
 */
export async function dismissAlert(req, res, next) {
  try {
    const alert = await alertsService.dismissAlert(req.validated.params.id);
    res.status(200).json({ data: alert });
  } catch (error) {
    next(error);
  }
}

/**
 * Get alert summary statistics
 * GET /api/v1/alerts/summary
 */
export async function getAlertSummary(req, res, next) {
  try {
    const filters = req.validated.query || {};
    const scopedFilters = isAdmin(req.user) ? scopeOrgFilters(req.user, filters) : filters;
    const summary = await alertsService.getAlertSummary(scopedFilters);
    res.status(200).json({ data: summary });
  } catch (error) {
    next(error);
  }
}

/**
 * Generate system alerts manually (admin/system use)
 * POST /api/v1/alerts/generate
 */
export async function generateSystemAlerts(req, res, next) {
  try {
    const result = await alertsService.generateAllSystemAlerts();
    res.status(200).json({ 
      data: result,
      message: `Generated ${result.total} new alerts`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Auto-resolve fixed alerts (admin/system use)
 * POST /api/v1/alerts/auto-resolve
 */
export async function autoResolveAlerts(req, res, next) {
  try {
    const result = await alertsService.autoResolveAlerts();
    res.status(200).json({ 
      data: result,
      message: `Auto-resolved ${result.resolved} alerts`,
    });
  } catch (error) {
    next(error);
  }
}
