import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/api/audit';
import type { PaginationParams } from '@/types/api';
import type { AuditFilters } from '@/types/audit';

export const useAuditLogs = (params: PaginationParams & AuditFilters) => {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditApi.getAuditLogs(params),
  });
};
