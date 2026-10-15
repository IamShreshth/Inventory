import { Badge } from '@/components/ui/Badge';
import type { IssueStatus } from '@/types/issue';

interface IssueStatusBadgeProps {
  status: IssueStatus;
}

const statusConfig: Record<
  IssueStatus,
  { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }
> = {
  requested: { variant: 'neutral', label: 'Requested' },
  active: { variant: 'success', label: 'Active' },
  dropped: { variant: 'warning', label: 'Dropped' },
  returned: { variant: 'neutral', label: 'Returned' },
  cancelled: { variant: 'error', label: 'Cancelled' },
};

export const IssueStatusBadge = ({ status }: IssueStatusBadgeProps) => {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};
