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

/**
 * Main alert generation job
 * Generates all types of system alerts
 */
export async function runAlertGeneration() {
  console.log('[Alert Job] Starting alert generation...');
  
  try {
    const result = await alertsService.generateAllSystemAlerts();
    
    console.log('[Alert Job] Alert generation completed:', {
      total: result.total,
      low_stock: result.by_type.low_stock,
      overdue_loans: result.by_type.overdue_loans,
      warranty_expiry: result.by_type.warranty_expiry,
    });
    
    return result;
  } catch (error) {
    console.error('[Alert Job] Error generating alerts:', error);
    throw error;
  }
}

/**
 * Auto-resolve alerts job
 * Automatically resolves alerts where conditions have been fixed
 */
export async function runAutoResolve() {
  console.log('[Alert Job] Starting auto-resolve...');
  
  try {
    const result = await alertsService.autoResolveAlerts();
    
    console.log('[Alert Job] Auto-resolve completed:', {
      resolved: result.resolved,
    });
    
    return result;
  } catch (error) {
    console.error('[Alert Job] Error auto-resolving alerts:', error);
    throw error;
  }
}

/**
 * Cleanup old alerts job
 * Deletes old resolved/dismissed alerts to keep the table manageable
 */
export async function runAlertCleanup(daysOld = 90) {
  console.log(`[Alert Job] Starting cleanup of alerts older than ${daysOld} days...`);
  
  try {
    const deleted = await alertsRepository.deleteOldAlerts(daysOld);
    
    console.log('[Alert Job] Cleanup completed:', {
      deleted,
    });
    
    return { deleted };
  } catch (error) {
    console.error('[Alert Job] Error cleaning up alerts:', error);
    throw error;
  }
}

/**
 * Combined job that runs generation, auto-resolve, and cleanup
 * Recommended for scheduled execution
 */
export async function runAllAlertJobs(cleanupDays = 90) {
  console.log('[Alert Job] Starting all alert jobs...');
  
  const startTime = Date.now();
  const results = {
    generation: null,
    autoResolve: null,
    cleanup: null,
    errors: [],
  };
  
  // Generate new alerts
  try {
    results.generation = await runAlertGeneration();
  } catch (error) {
    results.errors.push({ job: 'generation', error: error.message });
  }
  
  // Auto-resolve fixed alerts
  try {
    results.autoResolve = await runAutoResolve();
  } catch (error) {
    results.errors.push({ job: 'autoResolve', error: error.message });
  }
  
  // Cleanup old alerts
  try {
    results.cleanup = await runAlertCleanup(cleanupDays);
  } catch (error) {
    results.errors.push({ job: 'cleanup', error: error.message });
  }
  
  const duration = Date.now() - startTime;
  
  console.log('[Alert Job] All alert jobs completed:', {
    duration: `${duration}ms`,
    errors: results.errors.length,
  });
  
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
