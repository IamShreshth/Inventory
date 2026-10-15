import apiClient from '@/lib/api-client';
import type { ReportFilters, ReportResult } from '@/types/report';

export const reportsApi = {
  generateReport: async (filters: ReportFilters) => {
    const response = await apiClient.post<ReportResult>('/reports/generate', filters);
    return response.data;
  },
};
