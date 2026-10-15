export interface DashboardSummary {
  total_assets: number;
  available_assets: number;
  issued_assets: number;
  total_issues: number;
  active_issues: number;
  overdue_issues: number;
  pending_requests: number;
  dropped_items: number;
}

export interface RecentIssue {
  id: number;
  asset_name: string;
  borrower_name: string;
  status: string;
  created_at: string;
}

export interface RecentAsset {
  id: number;
  name: string;
  asset_tag: string;
  category_name: string | null;
  created_at: string;
}
