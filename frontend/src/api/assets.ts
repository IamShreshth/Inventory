import apiClient from '@/lib/api-client';
import type { PaginatedResponse, PaginationParams } from '@/types/api';
import type {
  Asset,
  AssetFilters,
  AssetCreateRequest,
  AssetUpdateRequest,
  QRCodeResponse,
  Category,
  Location,
  OrgUnit,
} from '@/types/asset';

export const assetsApi = {
  getAssets: async (params: PaginationParams & AssetFilters) => {
    const response = await apiClient.get<PaginatedResponse<Asset>>('/assets', { params });
    return response.data;
  },

  getAsset: async (id: number) => {
    const response = await apiClient.get<Asset>(`/assets/${id}`);
    return response.data;
  },

  createAsset: async (data: AssetCreateRequest) => {
    const response = await apiClient.post<Asset>('/assets', data);
    return response.data;
  },

  updateAsset: async (id: number, data: AssetUpdateRequest) => {
    const response = await apiClient.patch<Asset>(`/assets/${id}`, data);
    return response.data;
  },

  deleteAsset: async (id: number) => {
    await apiClient.delete(`/assets/${id}`);
  },

  generateQR: async (id: number) => {
    const response = await apiClient.post<QRCodeResponse>(`/assets/${id}/qr`);
    return response.data;
  },

  resolveQR: async (qrToken: string) => {
    const response = await apiClient.get<Asset>(`/assets/qr/${qrToken}`);
    return response.data;
  },

  // Reference data endpoints
  getCategories: async () => {
    const response = await apiClient.get<PaginatedResponse<Category>>('/categories', {
      params: { limit: 100 },
    });
    return response.data.data;
  },

  getLocations: async () => {
    const response = await apiClient.get<PaginatedResponse<Location>>('/locations', {
      params: { limit: 100 },
    });
    return response.data.data;
  },

  getOrgUnits: async () => {
    const response = await apiClient.get<PaginatedResponse<OrgUnit>>('/org-units', {
      params: { limit: 100 },
    });
    return response.data.data;
  },
};
