import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issuesApi } from '@/api/issues';
import type { PaginationParams } from '@/types/api';
import type {
  IssueFilters,
  IssueRequestData,
  IssueApproveData,
  IssueIssueData,
  IssueDropData,
  IssueReceiveData,
  IssueReturnData,
  IssueCancelData,
  IssueRenewData,
} from '@/types/issue';

export const useIssues = (params: PaginationParams & IssueFilters) => {
  return useQuery({
    queryKey: ['issues', params],
    queryFn: () => issuesApi.getIssues(params),
  });
};

export const useIssue = (id: number | null) => {
  return useQuery({
    queryKey: ['issues', id],
    queryFn: () => issuesApi.getIssue(id!),
    enabled: id !== null,
  });
};

export const useMyLoans = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['my-loans', params],
    queryFn: () => issuesApi.getMyLoans(params),
  });
};

export const useRequestIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IssueRequestData) => issuesApi.requestIssue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['my-loans'] });
    },
  });
};

export const useApproveIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IssueApproveData }) =>
      issuesApi.approveIssue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
};

export const useIssueEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IssueIssueData }) =>
      issuesApi.issueEquipment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useDropEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IssueDropData }) =>
      issuesApi.dropEquipment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['my-loans'] });
    },
  });
};

export const useReceiveEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IssueReceiveData }) =>
      issuesApi.receiveEquipment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useReturnEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IssueReturnData }) =>
      issuesApi.returnEquipment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useCancelIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IssueCancelData }) =>
      issuesApi.cancelIssue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['my-loans'] });
    },
  });
};

export const useRenewIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IssueRenewData }) =>
      issuesApi.renewIssue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['my-loans'] });
    },
  });
};
