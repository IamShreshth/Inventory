// src/modules/alerts/alert-jobs.js
/**
 * Alert generation jobs
 *
 * This module provides functions to be called by cron jobs or background workers
 * to automatically generate and manage system alerts.
 *
 * Usage with node-cron (example):
 *
 * import cron from 'node-cron';
 * import * as alertJobs from './modules/alerts/alert-jobs.js';
 *
 * // Run every hour
 * cron.schedule('0 * * * *', async () => {
 *   await alertJobs.runAlertGeneration();
 * });
 *
 * // Run cleanup daily at 2 AM
 * cron.schedule('0 2 * * *', async () => {
 *   await alertJobs.runAlertCleanup();
 * });
 */

import * as alertsService from './alerts.service.js';
import * as alertsRepository from './alerts.repository.js';
import logger from '../../utils/logger.js';

const jobLog = logger.child({ module: 'alert-jobs' });

/**
 * Main alert generation job
 * Generates all types of system alerts
 */
export async function runAlertGeneration() {
  jobLog.info('Starting alert generation');

  try {
    const result = await alertsService.generateAllSystemAlerts();

    jobLog.info(
      {
        total: result.total,
        low_stock: result.by_type.low_stock,
        overdue_loans: result.by_type.overdue_loans,
        warranty_expiry: result.by_type.warranty_expiry,
      },
      'Alert generation completed'
    );

    return result;
  } catch (error) {
    jobLog.error({ err: error }, 'Error generating alerts');
    throw error;
  }
}

/**
 * Auto-resolve alerts job
 * Automatically resolves alerts where conditions have been fixed
 */
export async function runAutoResolve() {
  jobLog.info('Starting auto-resolve');

  try {
    const result = await alertsService.autoResolveAlerts();

    jobLog.info({ resolved: result.resolved }, 'Auto-resolve completed');

    return result;
  } catch (error) {
    jobLog.error({ err: error }, 'Error auto-resolving alerts');
    throw error;
  }
}

/**
 * Cleanup old alerts job
 * Deletes old resolved/dismissed alerts to keep the table manageable
 */
export async function runAlertCleanup(daysOld = 90) {
  jobLog.info({ daysOld }, 'Starting alert cleanup');

  try {
    const deleted = await alertsRepository.deleteOldAlerts(daysOld);

    jobLog.info({ deleted }, 'Alert cleanup completed');

    return { deleted };
  } catch (error) {
    jobLog.error({ err: error }, 'Error cleaning up alerts');
    throw error;
  }
}

/**
 * Combined job that runs generation, auto-resolve, and cleanup
 * Recommended for scheduled execution
 */
export async function runAllAlertJobs(cleanupDays = 90) {
  jobLog.info('Starting all alert jobs');

  const startTime = Date.now();
  const results = {
    generation: null,
    autoResolve: null,
    cleanup: null,
    errors: [],
  };

  try {
    results.generation = await runAlertGeneration();
  } catch (error) {
    results.errors.push({ job: 'generation', error: error.message });
  }

  try {
    results.autoResolve = await runAutoResolve();
  } catch (error) {
    results.errors.push({ job: 'autoResolve', error: error.message });
  }

  try {
    results.cleanup = await runAlertCleanup(cleanupDays);
  } catch (error) {
    results.errors.push({ job: 'cleanup', error: error.message });
  }

  const durationMs = Date.now() - startTime;

  jobLog.info(
    { durationMs, errorCount: results.errors.length },
    'All alert jobs completed'
  );

  return results;
}

/**
 * Get alert job statistics
 * Useful for monitoring and health checks
 */
export async function getAlertJobStats() {
  const summary = await alertsService.getAlertSummary();

  return {
    timestamp: new Date().toISOString(),
    total_alerts: summary.total_alerts,
    active_alerts: summary.by_status.open + summary.by_status.acknowledged,
    critical_alerts: summary.by_severity.critical,
    summary,
  };
}
