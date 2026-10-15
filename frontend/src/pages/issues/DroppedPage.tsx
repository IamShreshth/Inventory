import { useState } from 'react';
import { useIssues, useReceiveEquipment } from '@/hooks/useIssues';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { IssueStatusBadge } from '@/components/issues/IssueStatusBadge';
import { useToast } from '@/components/ui/useToast';
import { Archive, CheckCircle } from 'lucide-react';
import type { Issue } from '@/types/issue';

export const DroppedPage = () => {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [receiveModal, setReceiveModal] = useState<{ isOpen: boolean; issue: Issue | null }>({
    isOpen: false,
    issue: null,
  });
  const [notes, setNotes] = useState('');

  const { data, isLoading, error } = useIssues({ page, limit, status: 'dropped' });
  const receiveEquipment = useReceiveEquipment();

  const handleReceive = async () => {
    if (!receiveModal.issue) return;

    try {
      await receiveEquipment.mutateAsync({
        id: receiveModal.issue.id,
        data: { notes: notes || undefined },
      });
      showToast('success', 'Equipment received successfully');
      setReceiveModal({ isOpen: false, issue: null });
      setNotes('');
    } catch (error) {
      showToast('error', 'Failed to receive equipment');
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-text mb-2">Failed to load dropped items</h2>
        <p className="text-sm text-text-muted">Please try again later</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-medium text-text">Dropped Items</h1>
          <p className="text-sm text-text-muted mt-1">
            Equipment dropped in boxes awaiting staff pickup
          </p>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : data?.data.length === 0 ? (
          <EmptyState
            icon={<Archive size={48} strokeWidth={1.5} />}
            title="No dropped items"
            description="All dropped equipment has been received"
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
                      </div>
                      <p className="text-sm text-text-muted">
                        Dropped by {issue.borrower_name} ({issue.borrower_email})
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
                      <dd className="text-text font-medium">{issue.dropped_quantity}</dd>
                    </div>
                    <div>
                      <dt className="text-text-muted">Dropped</dt>
                      <dd className="text-text">
                        {issue.dropped_at
                          ? new Date(issue.dropped_at).toLocaleDateString()
                          : '—'}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setReceiveModal({ isOpen: true, issue })}
                    >
                      <CheckCircle size={14} strokeWidth={1.5} />
                      Confirm Receipt
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination currentPage={page} totalPages={data!.meta.pages} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Receive Modal */}
      <Modal
        isOpen={receiveModal.isOpen}
        onClose={() => {
          setReceiveModal({ isOpen: false, issue: null });
          setNotes('');
        }}
        title="Receive Equipment"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Confirm receipt of <strong>{receiveModal.issue?.asset_name}</strong> from drop box
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
            <Button onClick={handleReceive} disabled={receiveEquipment.isPending}>
              {receiveEquipment.isPending ? 'Processing...' : 'Confirm Receipt'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setReceiveModal({ isOpen: false, issue: null });
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
