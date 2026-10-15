import apiClient from '@/lib/api-client';
import type { PaginatedResponse, PaginationParams } from '@/types/api';
import type {
  Issue,
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

export const issuesApi = {
  getIssues: async (params: PaginationParams & IssueFilters) => {
    const response = await apiClient.get<PaginatedResponse<Issue>>('/issues', { params });
    return response.data;
  },

  getIssue: async (id: number) => {
    const response = await apiClient.get<Issue>(`/issues/${id}`);
    return response.data;
  },

  // Borrower: request issue
  requestIssue: async (data: IssueRequestData) => {
    const response = await apiClient.post<Issue>('/issues', data);
    return response.data;
  },

  // Staff: approve request
  approveIssue: async (id: number, data: IssueApproveData) => {
    const response = await apiClient.post<Issue>(`/issues/${id}/approve`, data);
    return response.data;
  },

  // Staff: issue equipment (hand over)
  issueEquipment: async (id: number, data: IssueIssueData) => {
    const response = await apiClient.post<Issue>(`/issues/${id}/issue`, data);
    return response.data;
  },

  // Borrower: drop equipment in drop box
  dropEquipment: async (id: number, data: IssueDropData) => {
    const response = await apiClient.post<Issue>(`/issues/${id}/drop`, data);
    return response.data;
  },

  // Staff: receive dropped equipment
  receiveEquipment: async (id: number, data: IssueReceiveData) => {
    const response = await apiClient.post<Issue>(`/issues/${id}/receive`, data);
    return response.data;
  },

  // Staff: return equipment (final return)
  returnEquipment: async (id: number, data: IssueReturnData) => {
    const response = await apiClient.post<Issue>(`/issues/${id}/return`, data);
    return response.data;
  },

  // Cancel issue (staff or borrower depending on status)
  cancelIssue: async (id: number, data: IssueCancelData) => {
    const response = await apiClient.post<Issue>(`/issues/${id}/cancel`, data);
    return response.data;
  },

  // Borrower: renew issue
  renewIssue: async (id: number, data: IssueRenewData) => {
    const response = await apiClient.post<Issue>(`/issues/${id}/renew`, data);
    return response.data;
  },

  // Get my loans (for current user)
  getMyLoans: async (params: PaginationParams) => {
    const response = await apiClient.get<PaginatedResponse<Issue>>('/issues/my-loans', { params });
    return response.data;
  },
};
