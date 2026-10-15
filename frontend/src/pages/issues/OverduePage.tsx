import { useState } from 'react';
import { useIssues } from '@/hooks/useIssues';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { IssueStatusBadge } from '@/components/issues/IssueStatusBadge';
import { AlertTriangle, Clock } from 'lucide-react';
import type { Issue } from '@/types/issue';

export const OverduePage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data, isLoading, error } = useIssues({ page, limit, status: 'active', overdue: true });

  const getDaysOverdue = (issue: Issue) => {
    if (!issue.due_date) return 0;
    const diffTime = new Date().getTime() - new Date(issue.due_date).getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-text mb-2">Failed to load overdue issues</h2>
        <p className="text-sm text-text-muted">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-text">Overdue Issues</h1>
        <p className="text-sm text-text-muted mt-1">Equipment past its due date</p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : data?.data.length === 0 ? (
        <EmptyState
          icon={<Clock size={48} strokeWidth={1.5} />}
          title="No overdue issues"
          description="All equipment is on time or returned"
        />
      ) : (
        <>
          <div className="space-y-4">
            {data!.data.map((issue) => (
              <div
                key={issue.id}
                className="bg-surface border border-error/20 rounded p-4 hover:bg-background transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-medium text-text">{issue.asset_name}</h3>
                      <IssueStatusBadge status={issue.status} />
                      <Badge variant="error">
                        <AlertTriangle size={12} strokeWidth={1.5} />
                        {getDaysOverdue(issue)} days overdue
                      </Badge>
                    </div>
                    <p className="text-sm text-text-muted">
                      Issued to {issue.borrower_name} ({issue.borrower_email})
                    </p>
                  </div>
                </div>

                <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <dt className="text-text-muted">Asset Tag</dt>
                    <dd className="text-text font-medium">{issue.asset_tag}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Quantity</dt>
                    <dd className="text-text font-medium">{issue.quantity_issued}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Issued</dt>
                    <dd className="text-text">
                      {issue.issued_at ? new Date(issue.issued_at).toLocaleDateString() : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Due Date</dt>
                    <dd className="text-error font-medium">
                      {issue.due_date ? new Date(issue.due_date).toLocaleDateString() : '—'}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <Pagination currentPage={page} totalPages={data!.meta.pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};
