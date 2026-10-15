import * as service from './reports.service.js';

// Dashboard endpoints
export async function getDashboardSummary(req, res, next) {
  try {
    const summary = await service.getDashboardSummary();
    res.status(200).json({ data: summary });
  } catch (error) {
    next(error);
  }
}

export async function getOrgDashboard(req, res, next) {
  try {
    const summary = await service.getOrgDashboard(req.validated.params.orgId);
    res.status(200).json({ data: summary });
  } catch (error) {
    next(error);
  }
}

// Report endpoints
export async function getAssetInventoryReport(req, res, next) {
  try {
    const result = await service.getAssetInventoryReport(req.validated.query);
    
    if (req.validated.query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="asset-inventory-${Date.now()}.csv"`);
      res.status(200).send(result);
    } else {
      res.status(200).json({ data: result });
    }
  } catch (error) {
    next(error);
  }
}

export async function getBorrowingHistoryReport(req, res, next) {
  try {
    const result = await service.getBorrowingHistoryReport(req.validated.query);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function getOverdueLoansReport(req, res, next) {
  try {
    const result = await service.getOverdueLoansReport(req.validated.query);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function getMaintenanceCostsReport(req, res, next) {
  try {
    const result = await service.getMaintenanceCostsReport(req.validated.query);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function getDisposalSummaryReport(req, res, next) {
  try {
    const result = await service.getDisposalSummaryReport(req.validated.query);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function getVerificationProgressReport(req, res, next) {
  try {
    const result = await service.getVerificationProgressReport(req.validated.query);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function getAssetUtilizationReport(req, res, next) {
  try {
    const result = await service.getAssetUtilizationReport(req.validated.query);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}
