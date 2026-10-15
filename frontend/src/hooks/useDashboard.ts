import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => dashboardApi.getSummary(),
  });
};

export const useRecentIssues = (limit = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'recent-issues', limit],
    queryFn: () => dashboardApi.getRecentIssues(limit),
  });
};

export const useRecentAssets = (limit = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'recent-assets', limit],
    queryFn: () => dashboardApi.getRecentAssets(limit),
  });
};
