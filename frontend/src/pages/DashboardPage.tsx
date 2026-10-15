import { useDashboardSummary, useRecentIssues, useRecentAssets } from '@/hooks/useDashboard';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { IssueStatusBadge } from '@/components/issues/IssueStatusBadge';
import { Package, CheckCircle, AlertTriangle, FileText, Clock, Archive } from 'lucide-react';
import type { IssueStatus } from '@/types/issue';

export const DashboardPage = () => {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: recentIssues, isLoading: issuesLoading } = useRecentIssues(5);
  const { data: recentAssets, isLoading: assetsLoading } = useRecentAssets(5);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>
        <p className="text-base text-text-muted mt-2">Overview of your inventory system</p>
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height="140px" />
          ))}
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
              title="Total Assets"
              value={summary.total_assets}
              icon={<Package size={24} strokeWidth={2} />}
            />
            <SummaryCard
              title="Available Assets"
              value={summary.available_assets}
              icon={<CheckCircle size={24} strokeWidth={2} />}
              variant="success"
            />
            <SummaryCard
              title="Issued Assets"
              value={summary.issued_assets}
              icon={<FileText size={24} strokeWidth={2} />}
            />
            <SummaryCard
              title="Total Issues"
              value={summary.total_issues}
              icon={<FileText size={24} strokeWidth={2} />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
              title="Active Issues"
              value={summary.active_issues}
              icon={<CheckCircle size={24} strokeWidth={2} />}
            />
            <SummaryCard
              title="Overdue Issues"
              value={summary.overdue_issues}
              icon={<AlertTriangle size={24} strokeWidth={2} />}
              variant={summary.overdue_issues > 0 ? 'error' : 'default'}
            />
            <SummaryCard
              title="Pending Requests"
              value={summary.pending_requests}
              icon={<Clock size={24} strokeWidth={2} />}
              variant={summary.pending_requests > 0 ? 'warning' : 'default'}
            />
            <SummaryCard
              title="Dropped Items"
              value={summary.dropped_items}
              icon={<Archive size={24} strokeWidth={2} />}
            />
          </div>
        </>
      ) : null}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Issues */}
        <div className="bg-background border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <FileText size={20} strokeWidth={2} className="text-primary" />
            Recent Issues
          </h2>
          {issuesLoading ? (
            <Skeleton height="200px" />
          ) : recentIssues && recentIssues.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium">{issue.asset_name}</TableCell>
                    <TableCell className="text-text-muted">{issue.borrower_name}</TableCell>
                    <TableCell>
                      <IssueStatusBadge status={issue.status as IssueStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-sm text-text-muted text-center py-12 bg-surface rounded-lg">No recent issues</div>
          )}
        </div>

        {/* Recent Assets */}
        <div className="bg-background border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <Package size={20} strokeWidth={2} className="text-primary" />
            Recent Assets
          </h2>
          {assetsLoading ? (
            <Skeleton height="200px" />
          ) : recentAssets && recentAssets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell className="text-text-muted">{asset.asset_tag}</TableCell>
                    <TableCell className="text-text-muted">{asset.category_name || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-sm text-text-muted text-center py-12 bg-surface rounded-lg">No recent assets</div>
          )}
        </div>
      </div>
    </div>
  );
};
