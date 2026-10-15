import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import type { PaginationParams } from '@/types/api';
import type {
  OrgUnitFormData,
  CategoryFormData,
  LocationFormData,
  VendorFormData,
  PurchaseFormData,
  UserFormData,
  BorrowerBlockFormData,
  DropBoxFormData,
} from '@/types/admin';

// Org Units
export const useOrgUnits = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['org-units', params],
    queryFn: () => adminApi.getOrgUnits(params),
  });
};

export const useCreateOrgUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OrgUnitFormData) => adminApi.createOrgUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-units'] });
    },
  });
};

export const useUpdateOrgUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: OrgUnitFormData }) =>
      adminApi.updateOrgUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-units'] });
    },
  });
};

export const useDeleteOrgUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteOrgUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-units'] });
    },
  });
};

// Categories
export const useCategories = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => adminApi.getCategories(params),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryFormData) => adminApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryFormData }) =>
      adminApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Locations
export const useLocations = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['locations', params],
    queryFn: () => adminApi.getLocations(params),
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LocationFormData) => adminApi.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LocationFormData }) =>
      adminApi.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
};

// Vendors
export const useVendors = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['vendors', params],
    queryFn: () => adminApi.getVendors(params),
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VendorFormData) => adminApi.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VendorFormData }) =>
      adminApi.updateVendor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

// Purchases
export const usePurchases = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['purchases', params],
    queryFn: () => adminApi.getPurchases(params),
  });
};

export const usePurchase = (id: number | null) => {
  return useQuery({
    queryKey: ['purchases', id],
    queryFn: () => adminApi.getPurchase(id!),
    enabled: id !== null,
  });
};

export const usePurchaseLineItems = (purchaseId: number | null) => {
  return useQuery({
    queryKey: ['purchases', purchaseId, 'line-items'],
    queryFn: () => adminApi.getPurchaseLineItems(purchaseId!),
    enabled: purchaseId !== null,
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PurchaseFormData) => adminApi.createPurchase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });
};

export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PurchaseFormData }) =>
      adminApi.updatePurchase(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deletePurchase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });
};

// Users
export const useUsers = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => adminApi.getUsers(params),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserFormData) => adminApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserFormData> }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Borrower Blocks
export const useBorrowerBlocks = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['borrower-blocks', params],
    queryFn: () => adminApi.getBorrowerBlocks(params),
  });
};

export const useCreateBorrowerBlock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BorrowerBlockFormData) => adminApi.createBorrowerBlock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrower-blocks'] });
    },
  });
};

export const useUnblockBorrower = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.unblockBorrower(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrower-blocks'] });
    },
  });
};

// Drop Boxes
export const useDropBoxes = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['drop-boxes', params],
    queryFn: () => adminApi.getDropBoxes(params),
  });
};

export const useCreateDropBox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DropBoxFormData) => adminApi.createDropBox(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drop-boxes'] });
    },
  });
};

export const useUpdateDropBox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DropBoxFormData }) =>
      adminApi.updateDropBox(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drop-boxes'] });
    },
  });
};

export const useDeleteDropBox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteDropBox(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drop-boxes'] });
    },
  });
};
