import { pool } from '../../db/pool.js';

// Dashboard queries
export async function getDashboardSummary() {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM assets) as total_assets,
      (SELECT COUNT(*) FROM issues WHERE status IN ('active', 'dropped')) as active_issues,
      (SELECT COUNT(*) FROM issues WHERE status IN ('active', 'dropped') AND due_at < NOW()) as overdue_count,
      (SELECT COUNT(*) FROM assets WHERE quantity <= low_stock_threshold) as low_stock_count,
      (SELECT COUNT(*) FROM assets WHERE status = 'in_maintenance') as open_maintenance,
      0 as pending_verifications,
      0 as pending_disposals,
      0 as active_alerts
  `);
  
  return rows[0];
}

export async function getOrgDashboard(orgId) {
  const { rows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM assets WHERE owner_org_id = $1) as total_assets,
      (SELECT COUNT(*) FROM issues i 
       JOIN assets a ON i.asset_id = a.id 
       WHERE a.owner_org_id = $1 AND i.status IN ('active', 'dropped')) as active_issues,
      (SELECT COUNT(*) FROM issues i 
       JOIN assets a ON i.asset_id = a.id 
       WHERE a.owner_org_id = $1 AND i.status IN ('active', 'dropped') AND i.due_at < NOW()) as overdue_count,
      (SELECT COUNT(*) FROM assets WHERE owner_org_id = $1 AND quantity <= low_stock_threshold) as low_stock_count,
      (SELECT COUNT(*) FROM assets WHERE owner_org_id = $1 AND status = 'in_maintenance') as open_maintenance,
      0 as pending_verifications,
      0 as pending_disposals,
      0 as active_alerts
  `, [orgId]);
  
  return rows[0];
}

// Report queries
export async function getAssetInventory(filters) {
  const conditions = [];
  const values = [];
  let paramCount = 0;

  if (filters.org_unit_id) {
    paramCount++;
    conditions.push(`a.owner_org_id = $${paramCount}`);
    values.push(filters.org_unit_id);
  }

  if (filters.category_id) {
    paramCount++;
    conditions.push(`a.category_id = $${paramCount}`);
    values.push(filters.category_id);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(`
    SELECT 
      a.*,
      c.name as category_name,
      org.name as owner_org_name,
      l.name as location_name
    FROM assets a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN org_units org ON a.owner_org_id = org.id
    LEFT JOIN locations l ON a.location_id = l.id
    ${whereClause}
    ORDER BY a.name
    LIMIT 5000
  `, values);

  return rows;
}

export async function getBorrowingHistory(filters) {
  const conditions = [];
  const values = [];
  let paramCount = 0;

  if (filters.user_id) {
    paramCount++;
    conditions.push(`i.borrower_id = $${paramCount}`);
    values.push(filters.user_id);
  }

  if (filters.date_from) {
    paramCount++;
    conditions.push(`i.requested_at >= $${paramCount}::date`);
    values.push(filters.date_from);
  }

  if (filters.date_to) {
    paramCount++;
    conditions.push(`i.requested_at < ($${paramCount}::date + interval '1 day')`);
    values.push(filters.date_to);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(`
    SELECT 
      i.*,
      a.name as asset_name,
      a.asset_tag,
      u.full_name as borrower_name,
      issuer.full_name as issued_by_name,
      receiver.full_name as received_by_name
    FROM issues i
    JOIN assets a ON i.asset_id = a.id
    JOIN users u ON i.borrower_id = u.id
    LEFT JOIN users issuer ON i.issued_by = issuer.id
    LEFT JOIN users receiver ON i.received_by = receiver.id
    ${whereClause}
    ORDER BY i.requested_at DESC
    LIMIT 1000
  `, values);

  return rows;
}

export async function getOverdueLoans(filters) {
  const conditions = ['i.status IN (\'active\', \'dropped\')', 'i.due_at < NOW()'];
  const values = [];
  let paramCount = 0;

  if (filters.org_unit_id) {
    paramCount++;
    conditions.push(`a.owner_org_id = $${paramCount}`);
    values.push(filters.org_unit_id);
  }

  const { rows } = await pool.query(`
    SELECT 
      i.*,
      a.name as asset_name,
      a.asset_tag,
      u.full_name as borrower_name,
      u.institute_email as borrower_email,
      NOW() - i.due_at as overdue_duration
    FROM issues i
    JOIN assets a ON i.asset_id = a.id
    JOIN users u ON i.borrower_id = u.id
    WHERE ${conditions.join(' AND ')}
    ORDER BY i.due_at ASC
  `, values);

  return rows;
}

export async function getMaintenanceCosts(filters) {
  const conditions = [];
  const values = [];
  let paramCount = 0;

  if (filters.date_from) {
    paramCount++;
    conditions.push(`created_at >= $${paramCount}::date`);
    values.push(filters.date_from);
  }

  if (filters.date_to) {
    paramCount++;
    conditions.push(`created_at < ($${paramCount}::date + interval '1 day')`);
    values.push(filters.date_to);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(`
    SELECT 
      COUNT(*) as total_maintenance_records,
      COALESCE(SUM(CASE WHEN cost IS NOT NULL THEN 1 ELSE 0 END), 0) as records_with_cost,
      COALESCE(SUM(cost), 0) as total_cost,
      COALESCE(AVG(cost), 0) as average_cost,
      COALESCE(MIN(cost), 0) as min_cost,
      COALESCE(MAX(cost), 0) as max_cost
    FROM maintenance_records
    ${whereClause}
  `, values);

  return rows[0];
}

export async function getDisposalSummary(filters) {
  const conditions = [];
  const values = [];
  let paramCount = 0;

  if (filters.date_from) {
    paramCount++;
    conditions.push(`created_at >= $${paramCount}::date`);
    values.push(filters.date_from);
  }

  if (filters.date_to) {
    paramCount++;
    conditions.push(`created_at < ($${paramCount}::date + interval '1 day')`);
    values.push(filters.date_to);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(`
    SELECT 
      COUNT(*) as total_disposals,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      COALESCE(SUM(salvage_value), 0) as total_salvage_value
    FROM disposals
    ${whereClause}
  `, values);

  return rows[0];
}

export async function getVerificationProgress(filters) {
  const { rows } = await pool.query(`
    SELECT
      vc.id as cycle_id,
      vc.name as cycle_name,
      vc.status as cycle_status,
      vc.starts_on,
      vc.ends_on,
      COUNT(DISTINCT a.id) as total_assets,
      COUNT(DISTINCT v.id) as verified_assets,
      COUNT(DISTINCT a.id) - COUNT(DISTINCT v.id) as pending_assets,
      CASE 
        WHEN COUNT(DISTINCT a.id) > 0 
        THEN ROUND((COUNT(DISTINCT v.id)::numeric / COUNT(DISTINCT a.id)::numeric) * 100, 2)
        ELSE 0
      END as completion_percentage
    FROM verification_cycles vc
    LEFT JOIN assets a ON a.owner_org_id = vc.org_unit_id
    LEFT JOIN verifications v ON v.cycle_id = vc.id AND v.asset_id = a.id
    WHERE vc.id = $1
    GROUP BY vc.id, vc.name, vc.status, vc.starts_on, vc.ends_on
  `, [filters.cycle_id]);

  return rows[0] || null;
}

export async function getAssetUtilization(filters) {
  const conditions = [];
  const values = [];
  let paramCount = 0;

  if (filters.org_unit_id) {
    paramCount++;
    conditions.push(`a.owner_org_id = $${paramCount}`);
    values.push(filters.org_unit_id);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(`
    SELECT 
      a.id,
      a.name,
      a.asset_tag,
      COUNT(i.id) as total_issues,
      COUNT(CASE WHEN i.status IN ('active', 'dropped') THEN 1 END) as active_issues,
      COUNT(CASE WHEN i.status = 'returned' THEN 1 END) as completed_issues,
      COALESCE(AVG(EXTRACT(EPOCH FROM (i.returned_at - i.issued_at)) / 86400), 0)::numeric(10,2) as avg_loan_duration_days
    FROM assets a
    LEFT JOIN issues i ON i.asset_id = a.id AND i.issued_at IS NOT NULL
    ${whereClause}
    GROUP BY a.id, a.name, a.asset_tag
    HAVING COUNT(i.id) > 0
    ORDER BY total_issues DESC
    LIMIT 100
  `, values);

  return rows;
}
