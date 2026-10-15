export type IssueStatus = 'requested' | 'active' | 'dropped' | 'returned' | 'cancelled';

export interface Issue {
  id: number;
  asset_id: number;
  asset_name: string;
  asset_tag: string;
  borrower_id: number;
  borrower_name: string;
  borrower_email: string;
  quantity_requested: number;
  quantity_issued: number | null;
  status: IssueStatus;
  purpose: string | null;
  requested_at: string;
  approved_at: string | null;
  approved_by_id: number | null;
  approved_by_name: string | null;
  issued_at: string | null;
  issued_by_id: number | null;
  issued_by_name: string | null;
  due_date: string | null;
  dropped_at: string | null;
  dropped_quantity: number | null;
  received_at: string | null;
  received_by_id: number | null;
  received_by_name: string | null;
  returned_at: string | null;
  returned_by_id: number | null;
  returned_by_name: string | null;
  cancelled_at: string | null;
  cancelled_by_id: number | null;
  cancelled_by_name: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface IssueRequestData {
  asset_id: number;
  quantity_requested: number;
  purpose?: string;
}

export interface IssueApproveData {
  due_date?: string;
  notes?: string;
}

export interface IssueIssueData {
  quantity_issued: number;
}

export interface IssueDropData {
  drop_box_id: number;
  quantity_dropped: number;
}

export interface IssueReceiveData {
  notes?: string;
}

export interface IssueReturnData {
  notes?: string;
}

export interface IssueCancelData {
  cancellation_reason: string;
}

export interface IssueRenewData {
  new_due_date: string;
  reason?: string;
}

export interface IssueFilters {
  asset_id?: number;
  borrower_id?: number;
  status?: IssueStatus;
  overdue?: boolean;
}
