import { useState } from 'react';
import { useIssues, useReturnEquipment } from '@/hooks/useIssues';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { IssueStatusBadge } from '@/components/issues/IssueStatusBadge';
import { useToast } from '@/components/ui/useToast';
import { Package, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Issue } from '@/types/issue';

export const ActiveIssuesPage = () => {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [returnModal, setReturnModal] = useState<{ isOpen: boolean; issue: Issue | null }>({
    isOpen: false,
    issue: null,
  });
  const [notes, setNotes] = useState('');

  const { data, isLoading, error } = useIssues({ page, limit, status: 'active' });
  const returnEquipment = useReturnEquipment();

  const handleReturn = async () => {
    if (!returnModal.issue) return;

    try {
      await returnEquipment.mutateAsync({
        id: returnModal.issue.id,
        data: { notes: notes || undefined },
      });
      showToast('success', 'Equipment returned successfully');
      setReturnModal({ isOpen: false, issue: null });
      setNotes('');
    } catch (error) {
      showToast('error', 'Failed to return equipment');
    }
  };

  const isOverdue = (issue: Issue) => {
    if (!issue.due_date) return false;
    return new Date(issue.due_date) < new Date();
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-text mb-2">Failed to load active issues</h2>
        <p className="text-sm text-text-muted">Please try again later</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-medium text-text">Active Issues</h1>
          <p className="text-sm text-text-muted mt-1">
            Manage currently issued equipment and returns
          </p>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : data?.data.length === 0 ? (
          <EmptyState
            icon={<Package size={48} strokeWidth={1.5} />}
            title="No active issues"
            description="All equipment has been returned"
          />
        ) : (
          <>
            <div className="space-y-4">
              {data!.data.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-surface border border-border rounded p-4 hover:bg-background transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-medium text-text">{issue.asset_name}</h3>
                        <IssueStatusBadge status={issue.status} />
                        {isOverdue(issue) && (
                          <Badge variant="error">
                            <AlertTriangle size={12} strokeWidth={1.5} />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-text-muted">
                        Issued to {issue.borrower_name} ({issue.borrower_email})
                      </p>
                    </div>
                  </div>

                  <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
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
                        {issue.issued_at
                          ? new Date(issue.issued_at).toLocaleDateString()
                          : '—'}
                      </dd>
                    </div>
                    {issue.due_date && (
                      <div>
                        <dt className="text-text-muted">Due Date</dt>
                        <dd className={isOverdue(issue) ? 'text-error font-medium' : 'text-text'}>
                          {new Date(issue.due_date).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {issue.issued_by_name && (
                    <p className="text-sm text-text-muted mb-4">
                      <span className="font-medium">Issued by:</span> {issue.issued_by_name}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setReturnModal({ isOpen: true, issue })}
                    >
                      <CheckCircle size={14} strokeWidth={1.5} />
                      Mark as Returned
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination currentPage={page} totalPages={data!.meta.pages} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Return Modal */}
      <Modal
        isOpen={returnModal.isOpen}
        onClose={() => {
          setReturnModal({ isOpen: false, issue: null });
          setNotes('');
        }}
        title="Return Equipment"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Mark <strong>{returnModal.issue?.asset_name}</strong> as returned from{' '}
            <strong>{returnModal.issue?.borrower_name}</strong>
          </p>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Notes (optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Condition of equipment, any issues..."
              className="w-full px-3 py-2 text-base border border-border rounded bg-background text-text placeholder:text-text-muted focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-primary"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleReturn} disabled={returnEquipment.isPending}>
              {returnEquipment.isPending ? 'Processing...' : 'Mark as Returned'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setReturnModal({ isOpen: false, issue: null });
                setNotes('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
