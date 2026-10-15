import { useState } from 'react';
import { useIssues, useApproveIssue, useIssueEquipment, useCancelIssue } from '@/hooks/useIssues';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { IssueStatusBadge } from '@/components/issues/IssueStatusBadge';
import { useToast } from '@/components/ui/useToast';
import { CheckCircle, XCircle, Send, Inbox } from 'lucide-react';
import type { Issue } from '@/types/issue';

export const IssueQueuePage = () => {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [approveModal, setApproveModal] = useState<{ isOpen: boolean; issue: Issue | null }>({
    isOpen: false,
    issue: null,
  });
  const [issueModal, setIssueModal] = useState<{ isOpen: boolean; issue: Issue | null }>({
    isOpen: false,
    issue: null,
  });
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; issue: Issue | null }>({
    isOpen: false,
    issue: null,
  });
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [quantityIssued, setQuantityIssued] = useState<number>(1);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, error } = useIssues({ page, limit, status: 'requested' });
  const approveIssue = useApproveIssue();
  const issueEquipment = useIssueEquipment();
  const cancelIssue = useCancelIssue();

  const handleApprove = async () => {
    if (!approveModal.issue) return;

    try {
      await approveIssue.mutateAsync({
        id: approveModal.issue.id,
        data: { due_date: dueDate || undefined, notes: notes || undefined },
      });
      showToast('success', 'Request approved');
      setApproveModal({ isOpen: false, issue: null });
      setDueDate('');
      setNotes('');
    } catch (error) {
      showToast('error', 'Failed to approve request');
    }
  };

  const handleIssue = async () => {
    if (!issueModal.issue) return;

    try {
      await issueEquipment.mutateAsync({
        id: issueModal.issue.id,
        data: { quantity_issued: quantityIssued },
      });
      showToast('success', 'Equipment issued successfully');
      setIssueModal({ isOpen: false, issue: null });
      setQuantityIssued(1);
    } catch (error) {
      showToast('error', 'Failed to issue equipment');
    }
  };

  const handleReject = async () => {
    if (!rejectModal.issue || !rejectReason) return;

    try {
      await cancelIssue.mutateAsync({
        id: rejectModal.issue.id,
        data: { cancellation_reason: rejectReason },
      });
      showToast('success', 'Request rejected');
      setRejectModal({ isOpen: false, issue: null });
      setRejectReason('');
    } catch (error) {
      showToast('error', 'Failed to reject request');
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-text mb-2">Failed to load requests</h2>
        <p className="text-sm text-text-muted">Please try again later</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-medium text-text">Issue Requests</h1>
          <p className="text-sm text-text-muted mt-1">Review and approve equipment requests</p>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : data?.data.length === 0 ? (
          <EmptyState
            icon={<Inbox size={48} strokeWidth={1.5} />}
            title="No pending requests"
            description="All requests have been processed"
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
                        Requested by {issue.borrower_name} ({issue.borrower_email})
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
                      <dd className="text-text font-medium">{issue.quantity_requested}</dd>
                    </div>
                    <div>
                      <dt className="text-text-muted">Requested</dt>
                      <dd className="text-text">{new Date(issue.requested_at).toLocaleDateString()}</dd>
                    </div>
                  </dl>

                  {issue.purpose && (
                    <p className="text-sm text-text mb-4">
                      <span className="font-medium text-text-muted">Purpose:</span> {issue.purpose}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setApproveModal({ isOpen: true, issue });
                        setQuantityIssued(issue.quantity_requested);
                      }}
                    >
                      <CheckCircle size={14} strokeWidth={1.5} />
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setIssueModal({ isOpen: true, issue });
                        setQuantityIssued(issue.quantity_requested);
                      }}
                    >
                      <Send size={14} strokeWidth={1.5} />
                      Approve & Issue
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setRejectModal({ isOpen: true, issue })}
                    >
                      <XCircle size={14} strokeWidth={1.5} />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination currentPage={page} totalPages={data!.meta.pages} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={approveModal.isOpen}
        onClose={() => {
          setApproveModal({ isOpen: false, issue: null });
          setDueDate('');
          setNotes('');
        }}
        title="Approve Request"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Approve request for <strong>{approveModal.issue?.asset_name}</strong> by{' '}
            <strong>{approveModal.issue?.borrower_name}</strong>
          </p>
          <Input
            label="Due Date (optional)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Notes (optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..."
              className="w-full px-3 py-2 text-base border border-border rounded bg-background text-text placeholder:text-text-muted focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-primary"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleApprove} disabled={approveIssue.isPending}>
              {approveIssue.isPending ? 'Approving...' : 'Approve'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setApproveModal({ isOpen: false, issue: null });
                setDueDate('');
                setNotes('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Issue Equipment Modal */}
      <Modal
        isOpen={issueModal.isOpen}
        onClose={() => {
          setIssueModal({ isOpen: false, issue: null });
          setQuantityIssued(1);
        }}
        title="Approve & Issue Equipment"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Approve and immediately issue <strong>{issueModal.issue?.asset_name}</strong> to{' '}
            <strong>{issueModal.issue?.borrower_name}</strong>
          </p>
          <Input
            label="Quantity Issued"
            type="number"
            min="1"
            max={issueModal.issue?.quantity_requested}
            value={quantityIssued}
            onChange={(e) => setQuantityIssued(Number(e.target.value))}
            required
          />
          <div className="flex gap-2">
            <Button onClick={handleIssue} disabled={issueEquipment.isPending}>
              {issueEquipment.isPending ? 'Issuing...' : 'Issue Equipment'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIssueModal({ isOpen: false, issue: null });
                setQuantityIssued(1);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.isOpen}
        onClose={() => {
          setRejectModal({ isOpen: false, issue: null });
          setRejectReason('');
        }}
        title="Reject Request"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Reject request for <strong>{rejectModal.issue?.asset_name}</strong> by{' '}
            <strong>{rejectModal.issue?.borrower_name}</strong>
          </p>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">
              Reason <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Why is this request being rejected?"
              className="w-full px-3 py-2 text-base border border-border rounded bg-background text-text placeholder:text-text-muted focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-primary"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleReject}
              disabled={!rejectReason.trim() || cancelIssue.isPending}
            >
              {cancelIssue.isPending ? 'Rejecting...' : 'Reject Request'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setRejectModal({ isOpen: false, issue: null });
                setRejectReason('');
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
