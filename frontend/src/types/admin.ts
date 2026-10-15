import type { Role } from './api';

// Org Units
export interface OrgUnit {
  id: number;
  name: string;
  parent_id: number | null;
  parent_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrgUnitFormData {
  name: string;
  parent_id?: number;
}

// Categories
export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  parent_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  name: string;
  parent_id?: number;
}

// Locations
export interface Location {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface LocationFormData {
  name: string;
  description?: string;
}

// Vendors
export interface Vendor {
  id: number;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorFormData {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Purchases
export interface Purchase {
  id: number;
  vendor_id: number | null;
  vendor_name: string | null;
  purchase_date: string;
  invoice_number: string | null;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseLineItem {
  id: number;
  purchase_id: number;
  asset_id: number;
  asset_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface PurchaseFormData {
  vendor_id?: number;
  purchase_date: string;
  invoice_number?: string;
  total_amount: number;
  notes?: string;
}

// Users
export interface AdminUser {
  id: number;
  email: string;
  username: string;
  full_name: string;
  roles: Role[];
  created_at: string;
  updated_at: string;
}

export interface UserFormData {
  email: string;
  username: string;
  full_name: string;
  password?: string;
  roles: Role[];
}

// Borrower Blocks
export interface BorrowerBlock {
  id: number;
  borrower_id: number;
  borrower_name: string;
  borrower_email: string;
  reason: string;
  blocked_at: string;
  blocked_by_id: number;
  blocked_by_name: string;
  unblocked_at: string | null;
  unblocked_by_id: number | null;
  unblocked_by_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BorrowerBlockFormData {
  borrower_id: number;
  reason: string;
}

// Drop Boxes
export interface DropBox {
  id: number;
  name: string;
  location_id: number | null;
  location_name: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DropBoxFormData {
  name: string;
  location_id?: number;
  description?: string;
  is_active: boolean;
}
