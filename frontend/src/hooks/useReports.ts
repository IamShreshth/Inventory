import { useMutation } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports';
import type { ReportFilters } from '@/types/report';

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: (filters: ReportFilters) => reportsApi.generateReport(filters),
  });
};
