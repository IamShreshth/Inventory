import apiClient from '@/lib/api-client';
import type { DashboardSummary, RecentIssue, RecentAsset } from '@/types/dashboard';

export const dashboardApi = {
  getSummary: async () => {
    const response = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },

  getRecentIssues: async (limit = 5) => {
    const response = await apiClient.get<RecentIssue[]>('/dashboard/recent-issues', {
      params: { limit },
    });
    return response.data;
  },

  getRecentAssets: async (limit = 5) => {
    const response = await apiClient.get<RecentAsset[]>('/dashboard/recent-assets', {
      params: { limit },
    });
    return response.data;
  },
};
