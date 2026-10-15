export interface AuditLog {
  id: number;
  user_id: number | null;
  user_name: string | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditFilters {
  user_id?: number;
  entity_type?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
}
