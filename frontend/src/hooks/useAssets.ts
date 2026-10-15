import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi } from '@/api/assets';
import type { PaginationParams } from '@/types/api';
import type {
  AssetFilters,
  AssetCreateRequest,
  AssetUpdateRequest,
} from '@/types/asset';

export const useAssets = (params: PaginationParams & AssetFilters) => {
  return useQuery({
    queryKey: ['assets', params],
    queryFn: () => assetsApi.getAssets(params),
  });
};

export const useAsset = (id: number | null) => {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: () => assetsApi.getAsset(id!),
    enabled: id !== null,
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssetCreateRequest) => assetsApi.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssetUpdateRequest }) =>
      assetsApi.updateAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => assetsApi.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useGenerateQR = () => {
  return useMutation({
    mutationFn: (id: number) => assetsApi.generateQR(id),
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => assetsApi.getCategories(),
  });
};

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => assetsApi.getLocations(),
  });
};

export const useOrgUnits = () => {
  return useQuery({
    queryKey: ['org-units'],
    queryFn: () => assetsApi.getOrgUnits(),
  });
};
