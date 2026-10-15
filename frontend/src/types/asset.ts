export type AssetStatus = 'available' | 'issued' | 'maintenance' | 'retired';
export type TrackingType = 'individual' | 'quantity';

export interface Asset {
  id: number;
  name: string;
  description: string | null;
  asset_tag: string;
  tracking: TrackingType;
  quantity_total: number;
  quantity_available: number;
  category_id: number | null;
  category_name: string | null;
  location_id: number | null;
  location_name: string | null;
  org_unit_id: number | null;
  org_unit_name: string | null;
  status: AssetStatus;
  purchase_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface AssetFilters {
  category_id?: number;
  location_id?: number;
  org_unit_id?: number;
  status?: AssetStatus;
  tracking?: TrackingType;
}

export interface AssetCreateRequest {
  name: string;
  description?: string;
  asset_tag: string;
  tracking: TrackingType;
  quantity_total: number;
  category_id?: number;
  location_id?: number;
  org_unit_id?: number;
  status?: AssetStatus;
  purchase_id?: number;
}

export interface AssetUpdateRequest extends Partial<AssetCreateRequest> {}

export interface QRCodeResponse {
  qr_token: string;
}

export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrgUnit {
  id: number;
  name: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}
