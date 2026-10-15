// src/modules/alerts/alerts.service.js
import * as alertsRepository from './alerts.repository.js';
import { AppError } from '../../shared/app-error.js';
import { pool } from '../../db/pool.js';

/**
 * List alerts with filters and pagination
 */
export async function listAlerts({ limit, offset, filters, sort }) {
  // Define allowed sort columns
  const sortColumns = {
    created_at: 'a.created_at',
    updated_at: 'a.updated_at',
    severity: 'a.severity',
    status: 'a.status',
    type: 'a.type',
  };

  let sortClause = 'a.created_at DESC'; // Default sort

  if (sort) {
    const parts = sort.split(',').map(s => s.trim());
    const sortExpressions = [];

    for (const part of parts) {
      const descending = part.startsWith('-');
      const key = descending ? part.slice(1) : part;
      const column = sortColumns[key];

      if (!column) {
        throw new AppError('VALIDATION_ERROR', `Invalid sort field: ${key}`, 422);
      }

      sortExpressions.push(`${column} ${descending ? 'DESC' : 'ASC'}`);
    }

    sortClause = sortExpressions.join(', ');
  }

  return await alertsRepository.findAlerts({ filters, limit, offset, sort: sortClause });
}

/**
 * Get alert by ID
 */
export async function getAlertById(id) {
  const alert = await alertsRepository.findAlertById(id);

  if (!alert) {
    throw new AppError('NOT_FOUND', 'Alert not found', 404);
  }

  return alert;
}

/**
 * Create a new alert
 */
export async function createAlert(alertData) {
  // Check for existing similar alert to avoid duplicates
  if (alertData.entity_type && alertData.entity_id) {
    const existing = await alertsRepository.findExistingAlert({
      type: alertData.type,
      entity_type: alertData.entity_type,
      entity_id: alertData.entity_id,
    });

    if (existing) {
      // Return existing alert instead of creating duplicate
      return existing;
    }
  }

  return await alertsRepository.createAlert(alertData);
}

/**
 * Update an alert
 */
export async function updateAlert(id, updateData) {
  const alert = await alertsRepository.findAlertById(id);

  if (!alert) {
    throw new AppError('NOT_FOUND', 'Alert not found', 404);
  }

  // Prevent updating resolved/dismissed alerts
  if (alert.status === 'resolved' || alert.status === 'dismissed') {
    throw new AppError('INVALID_STATE', 'Cannot update resolved or dismissed alerts', 409);
  }

  return await alertsRepository.updateAlert(id, updateData);
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(id, userId) {
  const alert = await alertsRepository.findAlertById(id);

  if (!alert) {
    throw new AppError('NOT_FOUND', 'Alert not found', 404);
  }

  if (alert.status !== 'open') {
    throw new AppError('INVALID_STATE', 'Only open alerts can be acknowledged', 409);
  }

  return await alertsRepository.acknowledgeAlert(id, userId);
}

/**
 * Resolve an alert
 */
export async function resolveAlert(id, userId, resolutionNotes) {
  const alert = await alertsRepository.findAlertById(id);

  if (!alert) {
    throw new AppError('NOT_FOUND', 'Alert not found', 404);
  }

  if (alert.status === 'resolved') {
    throw new AppError('INVALID_STATE', 'Alert is already resolved', 409);
  }

  if (alert.status === 'dismissed') {
    throw new AppError('INVALID_STATE', 'Cannot resolve dismissed alerts', 409);
  }

  return await alertsRepository.resolveAlert(id, userId, resolutionNotes);
}

/**
 * Dismiss an alert
 */
export async function dismissAlert(id) {
  const alert = await alertsRepository.findAlertById(id);

  if (!alert) {
    throw new AppError('NOT_FOUND', 'Alert not found', 404);
  }

  if (alert.status === 'resolved' || alert.status === 'dismissed') {
    throw new AppError('INVALID_STATE', 'Alert is already closed', 409);
  }

  return await alertsRepository.dismissAlert(id);
}

/**
 * Get alert summary statistics
 */
export async function getAlertSummary(filters = {}) {
  const summary = await alertsRepository.getAlertSummary(filters);

  return {
    total_alerts: parseInt(summary.total_alerts, 10),
    by_status: {
      open: parseInt(summary.open_alerts, 10),
      acknowledged: parseInt(summary.acknowledged_alerts, 10),
      resolved: parseInt(summary.resolved_alerts, 10),
      dismissed: parseInt(summary.dismissed_alerts, 10),
    },
    by_severity: {
      critical: parseInt(summary.critical_alerts, 10),
      high: parseInt(summary.high_alerts, 10),
      medium: parseInt(summary.medium_alerts, 10),
      low: parseInt(summary.low_alerts, 10),
    },
    by_type: {
      low_stock: parseInt(summary.low_stock_alerts, 10),
      overdue_loan: parseInt(summary.overdue_loan_alerts, 10),
      warranty_expiry: parseInt(summary.warranty_expiry_alerts, 10),
      maintenance_due: parseInt(summary.maintenance_due_alerts, 10),
    },
  };
}

// ============================================================================
// Alert Generation Functions (System/Background Job Use)
// ============================================================================

/**
 * Generate low stock alerts for assets below threshold
 */
export async function generateLowStockAlerts() {
  const query = `
    SELECT 
      a.id,
      a.name,
      a.asset_tag,
      a.quantity,
      a.low_stock_threshold,
      a.owner_org_id,
      c.name as category_name
    FROM assets a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.quantity <= a.low_stock_threshold
      AND a.quantity > 0
      AND a.tracking = 'quantity'
      AND NOT EXISTS (
        SELECT 1 FROM alerts al
        WHERE al.asset_id = a.id
          AND al.type = 'low_stock'
          AND al.status IN ('open', 'acknowledged')
      )
  `;

  const result = await pool.query(query);
  const alerts = [];

  for (const asset of result.rows) {
    const alert = await createAlert({
      type: 'low_stock',
      severity: asset.quantity === 0 ? 'critical' : 'high',
      title: `Low Stock: ${asset.name}`,
      message: `Asset "${asset.name}" (${asset.asset_tag || 'N/A'}) is low on stock. Current quantity: ${asset.quantity}, Threshold: ${asset.low_stock_threshold}`,
      entity_type: 'asset',
      entity_id: asset.id,
      asset_id: asset.id,
      org_unit_id: asset.owner_org_id,
      metadata: {
        quantity: asset.quantity,
        threshold: asset.low_stock_threshold,
        category: asset.category_name,
      },
    });
    alerts.push(alert);
  }

  return alerts;
}

/**
 * Generate overdue loan alerts
 */
export async function generateOverdueLoanAlerts() {
  const query = `
    SELECT 
      i.id,
      i.asset_id,
      i.borrower_id,
      i.due_at,
      a.name as asset_name,
      a.asset_tag,
      a.owner_org_id,
      u.full_name as borrower_name,
      u.institute_email as borrower_email
    FROM issues i
    JOIN assets a ON i.asset_id = a.id
    JOIN users u ON i.borrower_id = u.id
    WHERE i.status IN ('active', 'dropped')
      AND i.due_at < now()
      AND NOT EXISTS (
        SELECT 1 FROM alerts al
        WHERE al.issue_id = i.id
          AND al.type = 'overdue_loan'
          AND al.status IN ('open', 'acknowledged')
      )
  `;

  const result = await pool.query(query);
  const alerts = [];

  for (const issue of result.rows) {
    const daysOverdue = Math.floor((Date.now() - new Date(issue.due_at)) / (1000 * 60 * 60 * 24));
    
    let severity = 'medium';
    if (daysOverdue > 30) severity = 'critical';
    else if (daysOverdue > 14) severity = 'high';

    const alert = await createAlert({
      type: 'overdue_loan',
      severity,
      title: `Overdue Loan: ${issue.asset_name}`,
      message: `Asset "${issue.asset_name}" (${issue.asset_tag || 'N/A'}) borrowed by ${issue.borrower_name} is ${daysOverdue} day(s) overdue. Due date: ${new Date(issue.due_at).toLocaleDateString()}`,
      entity_type: 'issue',
      entity_id: issue.id,
      asset_id: issue.asset_id,
      issue_id: issue.id,
      org_unit_id: issue.owner_org_id,
      metadata: {
        borrower_id: issue.borrower_id,
        borrower_name: issue.borrower_name,
        borrower_email: issue.borrower_email,
        due_at: issue.due_at,
        days_overdue: daysOverdue,
      },
    });
    alerts.push(alert);
  }

  return alerts;
}

/**
 * Generate warranty expiry alerts
 */
export async function generateWarrantyExpiryAlerts(daysBeforeExpiry = 30) {
  const query = `
    SELECT 
      a.id,
      a.name,
      a.asset_tag,
      a.warranty_until,
      a.owner_org_id,
      c.name as category_name
    FROM assets a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.warranty_until IS NOT NULL
      AND a.warranty_until BETWEEN now() AND now() + $1 * interval '1 day'
      AND NOT EXISTS (
        SELECT 1 FROM alerts al
        WHERE al.asset_id = a.id
          AND al.type = 'warranty_expiry'
          AND al.status IN ('open', 'acknowledged')
      )
  `;

  const result = await pool.query(query, [daysBeforeExpiry]);
  const alerts = [];

  for (const asset of result.rows) {
    const daysUntilExpiry = Math.floor((new Date(asset.warranty_until) - Date.now()) / (1000 * 60 * 60 * 24));
    
    let severity = 'low';
    if (daysUntilExpiry <= 7) severity = 'high';
    else if (daysUntilExpiry <= 14) severity = 'medium';

    const alert = await createAlert({
      type: 'warranty_expiry',
      severity,
      title: `Warranty Expiring: ${asset.name}`,
      message: `Warranty for asset "${asset.name}" (${asset.asset_tag || 'N/A'}) expires in ${daysUntilExpiry} day(s) on ${new Date(asset.warranty_until).toLocaleDateString()}`,
      entity_type: 'asset',
      entity_id: asset.id,
      asset_id: asset.id,
      org_unit_id: asset.owner_org_id,
      metadata: {
        warranty_until: asset.warranty_until,
        days_until_expiry: daysUntilExpiry,
        category: asset.category_name,
      },
    });
    alerts.push(alert);
  }

  return alerts;
}

/**
 * Generate all system alerts (can be called by a cron job)
 */
export async function generateAllSystemAlerts() {
  const results = {
    low_stock: await generateLowStockAlerts(),
    overdue_loans: await generateOverdueLoanAlerts(),
    warranty_expiry: await generateWarrantyExpiryAlerts(),
  };

  return {
    total: results.low_stock.length + results.overdue_loans.length + results.warranty_expiry.length,
    by_type: {
      low_stock: results.low_stock.length,
      overdue_loans: results.overdue_loans.length,
      warranty_expiry: results.warranty_expiry.length,
    },
    alerts: results,
  };
}

/**
 * Auto-resolve alerts when their conditions are fixed
 */
export async function autoResolveAlerts() {
  let resolved = 0;

  // Resolve low stock alerts where stock is now adequate
  const lowStockQuery = `
    UPDATE alerts al
    SET status = 'resolved',
        resolved_at = now(),
        resolution_notes = 'Auto-resolved: Stock level is now adequate',
        updated_at = now()
    FROM assets a
    WHERE al.type = 'low_stock'
      AND al.status IN ('open', 'acknowledged')
      AND al.asset_id = a.id
      AND a.quantity > a.low_stock_threshold
    RETURNING al.id
  `;
  const lowStockResult = await pool.query(lowStockQuery);
  resolved += lowStockResult.rows.length;

  // Resolve overdue loan alerts where issue is now returned
  const overdueQuery = `
    UPDATE alerts al
    SET status = 'resolved',
        resolved_at = now(),
        resolution_notes = 'Auto-resolved: Item has been returned',
        updated_at = now()
    FROM issues i
    WHERE al.type = 'overdue_loan'
      AND al.status IN ('open', 'acknowledged')
      AND al.issue_id = i.id
      AND i.status IN ('returned', 'cancelled')
    RETURNING al.id
  `;
  const overdueResult = await pool.query(overdueQuery);
  resolved += overdueResult.rows.length;

  return { resolved };
}
