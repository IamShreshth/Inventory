import { useState } from 'react';
import { useAuditLogs } from '@/hooks/useAudit';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Eye } from 'lucide-react';

export const AuditLogPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading } = useAuditLogs({
    page,
    limit,
    entity_type: entityType || undefined,
    action: action || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-text">Audit Log</h1>
        <p className="text-sm text-text-muted mt-1">System activity and change history</p>
      </div>

      <div className="bg-surface border border-border rounded p-4 space-y-4">
        <h2 className="text-base font-medium text-text">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Entity Type"
            placeholder="e.g. asset, issue..."
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
          />

          <Input
            label="Action"
            placeholder="e.g. create, update..."
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />

          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : data?.data.length === 0 ? (
        <EmptyState
          icon={<Eye size={48} strokeWidth={1.5} />}
          title="No audit logs"
          description="No activity found matching your filters"
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data!.data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-text-muted">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{log.user_name || 'System'}</TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 text-xs bg-surface rounded">{log.action}</span>
                  </TableCell>
                  <TableCell className="text-text-muted">
                    {log.entity_type}
                    {log.entity_id && ` #${log.entity_id}`}
                  </TableCell>
                  <TableCell className="text-text-muted">{log.ip_address || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination currentPage={page} totalPages={data!.meta.pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};
