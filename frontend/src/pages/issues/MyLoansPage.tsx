import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyLoans, useRenewIssue, useCancelIssue } from '@/hooks/useIssues';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { IssueStatusBadge } from '@/components/issues/IssueStatusBadge';
import { useToast } from '@/components/ui/useToast';
import { Plus, Clock, RefreshCw, X, AlertTriangle } from 'lucide-react';
import type { Issue } from '@/types/issue';

export const MyLoansPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [renewModal, setRenewModal] = useState<{ isOpen: boolean; issue: Issue | null }>({
    isOpen: false,
    issue: null,
  });
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; issue: Issue | null }>({
    isOpen: false,
    issue: null,
  });
  const [newDueDate, setNewDueDate] = useState('');
  const [renewReason, setRenewReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const { data, isLoading, error } = useMyLoans({ page, limit });
  const renewIssue = useRenewIssue();
  const cancelIssue = useCancelIssue();

  const handleRenew = async () => {
    if (!renewModal.issue || !newDueDate) return;

    try {
      await renewIssue.mutateAsync({
        id: renewModal.issue.id,
        data: { new_due_date: newDueDate, reason: renewReason || undefined },
      });
      showToast('success', 'Renewal request submitted');
      setRenewModal({ isOpen: false, issue: null });
      setNewDueDate('');
      setRenewReason('');
    } catch (error) {
      showToast('error', 'Failed to submit renewal request');
    }
  };

  const handleCancel = async () => {
    if (!cancelModal.issue || !cancelReason) return;

    try {
      await cancelIssue.mutateAsync({
        id: cancelModal.issue.id,
        data: { cancellation_reason: cancelReason },
      });
      showToast('success', 'Request cancelled');
      setCancelModal({ isOpen: false, issue: null });
      setCancelReason('');
    } catch (error) {
      showToast('error', 'Failed to cancel request');
    }
  };

  const isOverdue = (issue: Issue) => {
    if (!issue.due_date || issue.status !== 'active') return false;
    return new Date(issue.due_date) < new Date();
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-text mb-2">Failed to load loans</h2>
        <p className="text-sm text-text-muted">Please try again later</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-text">My Loans</h1>
            <p className="text-sm text-text-muted mt-1">View and manage your borrowed equipment</p>
          </div>
          <Button onClick={() => navigate('/request-issue')}>
            <Plus size={16} strokeWidth={1.5} />
            Request Equipment
          </Button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : data?.data.length === 0 ? (
          <EmptyState
            icon={<Clock size={48} strokeWidth={1.5} />}
            title="No loans yet"
            description="Request equipment to get started"
            action={
              <Button onClick={() => navigate('/request-issue')}>
                <Plus size={16} strokeWidth={1.5} />
                Request Equipment
              </Button>
            }
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
                      <p className="text-sm text-text-muted">Asset Tag: {issue.asset_tag}</p>
                    </div>
                  </div>

                  <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                    <div>
                      <dt className="text-text-muted">Quantity</dt>
                      <dd className="text-text font-medium">
                        {issue.quantity_issued || issue.quantity_requested}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-text-muted">Requested</dt>
                      <dd className="text-text">{new Date(issue.requested_at).toLocaleDateString()}</dd>
                    </div>
                    {issue.issued_at && (
                      <div>
                        <dt className="text-text-muted">Issued</dt>
                        <dd className="text-text">{new Date(issue.issued_at).toLocaleDateString()}</dd>
                      </div>
                    )}
                    {issue.due_date && (
                      <div>
                        <dt className="text-text-muted">Due Date</dt>
                        <dd className={isOverdue(issue) ? 'text-error font-medium' : 'text-text'}>
                          {new Date(issue.due_date).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {issue.purpose && (
                    <p className="text-sm text-text-muted mb-4">
                      <span className="font-medium">Purpose:</span> {issue.purpose}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {issue.status === 'active' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setRenewModal({ isOpen: true, issue })}
                        >
                          <RefreshCw size={14} strokeWidth={1.5} />
                          Request Renewal
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/drop-equipment/${issue.id}`)}
                        >
                          Drop in Box
                        </Button>
                      </>
                    )}
                    {issue.status === 'requested' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCancelModal({ isOpen: true, issue })}
                      >
                        <X size={14} strokeWidth={1.5} />
                        Cancel Request
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={data!.meta.pages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Renew Modal */}
      <Modal
        isOpen={renewModal.isOpen}
        onClose={() => {
          setRenewModal({ isOpen: false, issue: null });
          setNewDueDate('');
          setRenewReason('');
        }}
        title="Request Renewal"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Request to extend the due date for <strong>{renewModal.issue?.asset_name}</strong>
          </p>
          <Input
            label="New Due Date"
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Reason (optional)</label>
            <textarea
              rows={3}
              value={renewReason}
              onChange={(e) => setRenewReason(e.target.value)}
              placeholder="Why do you need an extension?"
              className="w-full px-3 py-2 text-base border border-border rounded bg-background text-text placeholder:text-text-muted focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-primary"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRenew} disabled={!newDueDate || renewIssue.isPending}>
              {renewIssue.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setRenewModal({ isOpen: false, issue: null });
                setNewDueDate('');
                setRenewReason('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => {
          setCancelModal({ isOpen: false, issue: null });
          setCancelReason('');
        }}
        title="Cancel Request"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Cancel your request for <strong>{cancelModal.issue?.asset_name}</strong>
          </p>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">
              Reason <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Why are you cancelling this request?"
              className="w-full px-3 py-2 text-base border border-border rounded bg-background text-text placeholder:text-text-muted focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-primary"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              disabled={!cancelReason.trim() || cancelIssue.isPending}
            >
              {cancelIssue.isPending ? 'Cancelling...' : 'Cancel Request'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setCancelModal({ isOpen: false, issue: null });
                setCancelReason('');
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
