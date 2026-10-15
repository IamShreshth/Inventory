export type ReportType = 
  | 'assets_by_category' 
  | 'assets_by_location' 
  | 'issues_by_borrower' 
  | 'overdue_report' 
  | 'utilization_report';

export interface ReportFilters {
  report_type: ReportType;
  start_date?: string;
  end_date?: string;
  category_id?: number;
  location_id?: number;
  org_unit_id?: number;
}

export interface ReportRow {
  [key: string]: string | number | null;
}

export interface ReportResult {
  report_type: ReportType;
  title: string;
  columns: Array<{ key: string; label: string }>;
  rows: ReportRow[];
  generated_at: string;
}
