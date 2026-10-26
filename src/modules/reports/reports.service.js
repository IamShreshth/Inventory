import * as repository from './reports.repository.js';
import { stringify } from 'csv-stringify/sync';

// Dashboard services
export async function getDashboardSummary(borrowerId = null, orgIds = null) {
  const summary = await repository.getDashboardSummary(borrowerId, orgIds);
  return summary;
}

export async function getOrgDashboard(orgId) {
  const summary = await repository.getOrgDashboard(orgId);
  return summary;
}

// Report services
export async function getAssetInventoryReport(filters) {
  const assets = await repository.getAssetInventory(filters);
  
  if (filters.format === 'csv') {
    const records = assets.map(asset => ({
      'Asset Tag': asset.asset_tag || '',
      'Name': asset.name,
      'Category': asset.category_name || '',
      'Tracking': asset.tracking,
      'Quantity': asset.quantity,
      'Condition': asset.condition,
      'Status': asset.status,
      'Location': asset.location_name || '',
      'Owner Organization': asset.owner_org_name || '',
      'Unit Cost': asset.unit_cost || '',
      'Is Issuable': asset.is_issuable ? 'Yes' : 'No',
    }));

    return stringify(records, {
      header: true,
      quoted: true,
    });
  }

  return assets;
}

export async function getBorrowingHistoryReport(filters) {
  return repository.getBorrowingHistory(filters);
}

export async function getOverdueLoansReport(filters) {
  return repository.getOverdueLoans(filters);
}

export async function getMaintenanceCostsReport(filters) {
  return repository.getMaintenanceCosts(filters);
}

export async function getDisposalSummaryReport(filters) {
  return repository.getDisposalSummary(filters);
}

export async function getVerificationProgressReport(filters) {
  return repository.getVerificationProgress(filters);
}

export async function getAssetUtilizationReport(filters) {
  return repository.getAssetUtilization(filters);
}
