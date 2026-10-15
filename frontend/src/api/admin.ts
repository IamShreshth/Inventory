import apiClient from '@/lib/api-client';
import type { PaginatedResponse, PaginationParams } from '@/types/api';
import type {
  OrgUnit,
  OrgUnitFormData,
  Category,
  CategoryFormData,
  Location,
  LocationFormData,
  Vendor,
  VendorFormData,
  Purchase,
  PurchaseFormData,
  PurchaseLineItem,
  AdminUser,
  UserFormData,
  BorrowerBlock,
  BorrowerBlockFormData,
  DropBox,
  DropBoxFormData,
} from '@/types/admin';

export const adminApi = {
  // Org Units
  getOrgUnits: async (params?: PaginationParams) => {
    const response = await apiClient.get<PaginatedResponse<OrgUnit>>('/org-units', { params });
    return response.data;
  },
  createOrgUnit: async (data: OrgUnitFormData) => {
    const response = await apiClient.post<OrgUnit>('/org-units', data);
    return response.data;
  },
  updateOrgUnit: async (id: number, data: OrgUnitFormData) => {
    const response = await apiClient.patch<OrgUnit>(`/org-units/${id}`, data);
    return response.data;
  },
  deleteOrgUnit: async (id: number) => {
    await apiClient.delete(`/org-units/${id}`);
  },

  // Categories
  getCategories: async (params?: PaginationParams) => {
    const response = await apiClient.get<PaginatedResponse<Category>>('/categories', { params });
    return response.data;
  },
  createCategory: async (data: CategoryFormData) => {
    const response = await apiClient.post<Category>('/categories', data);
    return response.data;
  },
  updateCategory: async (id: number, data: CategoryFormData) => {
    const response = await apiClient.patch<Category>(`/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id: number) => {
    await apiClient.delete(`/categories/${id}`);
  },

  // Locations
  getLocations: async (params?: PaginationParams) => {
    const response = await apiClient.get<PaginatedResponse<Location>>('/locations', { params });
    return response.data;
  },
  createLocation: async (data: LocationFormData) => {
    const response = await apiClient.post<Location>('/locations', data);
    return response.data;
  },
  updateLocation: async (id: number, data: LocationFormData) => {
    const response = await apiClient.patch<Location>(`/locations/${id}`, data);
    return response.data;
  },
  deleteLocation: async (id: number) => {
    await apiClient.delete(`/locations/${id}`);
  },

  // Vendors
  getVendors: async (params?: PaginationParams) => {
    const response = await apiClient.get<PaginatedResponse<Vendor>>('/vendors', { params });
    return response.data;
  },
  createVendor: async (data: VendorFormData) => {
    const response = await apiClient.post<Vendor>('/vendors', data);
    return response.data;
  },
  updateVendor: async (id: number, data: VendorFormData) => {
    const response = await apiClient.patch<Vendor>(`/vendors/${id}`, data);
    return response.data;
  },
  deleteVendor: async (id: number) => {
    await apiClient.delete(`/vendors/${id}`);
  },

  // Purchases
  getPurchases: async (params?: PaginationParams) => {
    const response = await apiClient.get<PaginatedResponse<Purchase>>('/purchases', { params });
    return response.data;
  },
  getPurchase: async (id: number) => {
    const response = await apiClient.get<Purchase>(`/purchases/${id}`);
    return response.data;
  },
  getPurchaseLineItems: async (purchaseId: number) => {
    const response = await apiClient.get<PurchaseLineItem[]>(`/purchases/${purchaseId}/line-items`);
    return response.data;
  },
  createPurchase: async (data: PurchaseFormData) => {
    const response = await apiClient.post<Purchase>('/purchases', data);
    return response.data;
  },
  updatePurchase: async (id: number, data: PurchaseFormData) => {
    const response = await apiClient.patch<Purchase>(`/purchases/${id}`, data);
    return response.data;
  },
  deletePurchase: async (id: number) => {
    await apiClient.delete(`/purchases/${id}`);
  },

  // Users
  getUsers: async (params?: PaginationParams) => {
    const response = await apiClient.get<PaginatedResponse<AdminUser>>('/users', { params });
    return response.data;
  },
  createUser: async (data: UserFormData) => {
    const response = await apiClient.post<AdminUser>('/users', data);
    return response.data;
  },
  updateUser: async (id: number, data: Partial<UserFormData>) => {
    const response = await apiClient.patch<AdminUser>(`/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: number) => {
    await apiClient.delete(`/users/${id}`);
  },

  // Borrower Blocks
  getBorrowerBlocks: async (params?: PaginationParams) => {
    const response = await apiClient.get<PaginatedResponse<BorrowerBlock>>('/borrower-blocks', {
      params,
    });
    return response.data;
  },
  createBorrowerBlock: async (data: BorrowerBlockFormData) => {
    const response = await apiClient.post<BorrowerBlock>('/borrower-blocks', data);
    return response.data;
  },
  unblockBorrower: async (id: number) => {
    const response = await apiClient.post<BorrowerBlock>(`/borrower-blocks/${id}/unblock`);
    return response.data;
  },

  // Drop Boxes
  getDropBoxes: async (params?: PaginationParams) => {
    const response = await apiClient.get<PaginatedResponse<DropBox>>('/drop-boxes', { params });
    return response.data;
  },
  createDropBox: async (data: DropBoxFormData) => {
    const response = await apiClient.post<DropBox>('/drop-boxes', data);
    return response.data;
  },
  updateDropBox: async (id: number, data: DropBoxFormData) => {
    const response = await apiClient.patch<DropBox>(`/drop-boxes/${id}`, data);
    return response.data;
  },
  deleteDropBox: async (id: number) => {
    await apiClient.delete(`/drop-boxes/${id}`);
  },
};
