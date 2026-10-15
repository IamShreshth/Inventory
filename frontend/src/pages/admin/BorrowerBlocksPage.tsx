import { useState } from 'react';
import { useBorrowerBlocks, useCreateBorrowerBlock, useUnblockBorrower } from '@/hooks/useAdmin';
import { useUsers } from '@/hooks/useAdmin';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { borrowerBlockSchema, BorrowerBlockSchemaData } from '@/schemas/admin';
import { Button } from '@/components/ui/Button';
import { Select, SelectOption } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
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
import { useToast } from '@/components/ui/useToast';
import { Plus, Ban, CheckCircle } from 'lucide-react';

export const BorrowerBlocksPage = () => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useBorrowerBlocks({ limit: 100 });
  const { data: usersData } = useUsers({ limit: 100 });
  const createBorrowerBlock = useCreateBorrowerBlock();
  const unblockBorrower = useUnblockBorrower();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BorrowerBlockSchemaData>({
    resolver: zodResolver(borrowerBlockSchema),
  });

  const borrowerOptions: SelectOption[] = [
    { value: '', label: 'Select borrower' },
    ...(usersData?.data
      .filter((u) => u.roles.includes('borrower'))
      .map((u) => ({ value: String(u.id), label: `${u.full_name} (${u.email})` })) || []),
  ];

  const openModal = () => {
    reset({ borrower_id: 0, reason: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const onSubmit = async (data: BorrowerBlockSchemaData) => {
    try {
      await createBorrowerBlock.mutateAsync(data);
      showToast('success', 'Borrower blocked');
      closeModal();
    } catch (error) {
      showToast('error', 'Failed to block borrower');
    }
  };

  const handleUnblock = async (id: number) => {
    if (!confirm('Unblock this borrower?')) return;
    try {
      await unblockBorrower.mutateAsync(id);
      showToast('success', 'Borrower unblocked');
    } catch (error) {
      showToast('error', 'Failed to unblock borrower');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-text">Borrower Blocks</h1>
            <p className="text-sm text-text-muted mt-1">Manage blocked borrowers</p>
          </div>
          <Button onClick={openModal}>
            <Plus size={16} strokeWidth={1.5} />
            Block Borrower
          </Button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : data?.data.length === 0 ? (
          <EmptyState
            icon={<Ban size={48} strokeWidth={1.5} />}
            title="No blocks"
            description="No borrowers are currently blocked"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Blocked By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data!.data.map((block) => (
                <TableRow key={block.id}>
                  <TableCell className="font-medium">
                    {block.borrower_name}
                    <div className="text-xs text-text-muted">{block.borrower_email}</div>
                  </TableCell>
                  <TableCell className="text-text-muted">{block.reason}</TableCell>
                  <TableCell className="text-text-muted">{block.blocked_by_name}</TableCell>
                  <TableCell className="text-text-muted">
                    {new Date(block.blocked_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={block.is_active ? 'error' : 'neutral'}>
                      {block.is_active ? 'Blocked' : 'Unblocked'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {block.is_active && (
                      <Button variant="ghost" size="sm" onClick={() => handleUnblock(block.id)}>
                        <CheckCircle size={14} strokeWidth={1.5} />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Block Borrower" size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Borrower"
            options={borrowerOptions}
            error={errors.borrower_id?.message}
            required
            defaultValue=""
            {...register('borrower_id', {
              setValueAs: (v) => (v === '' ? 0 : Number(v)),
            })}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">
              Reason <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Why is this borrower being blocked?"
              className="w-full px-3 py-2 text-base border border-border rounded bg-background text-text placeholder:text-text-muted focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-primary"
              {...register('reason')}
            />
            {errors.reason && <span className="text-sm text-error">{errors.reason.message}</span>}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Blocking...' : 'Block Borrower'}
            </Button>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
