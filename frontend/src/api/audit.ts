import apiClient from '@/lib/api-client';
import type { PaginatedResponse, PaginationParams } from '@/types/api';
import type { AuditLog, AuditFilters } from '@/types/audit';

export const auditApi = {
  getAuditLogs: async (params: PaginationParams & AuditFilters) => {
    const response = await apiClient.get<PaginatedResponse<AuditLog>>('/audit-logs', { params });
    return response.data;
  },
};
