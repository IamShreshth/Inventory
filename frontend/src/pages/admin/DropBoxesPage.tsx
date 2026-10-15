import { useState } from 'react';
import {
  useDropBoxes,
  useCreateDropBox,
  useUpdateDropBox,
  useDeleteDropBox,
} from '@/hooks/useAdmin';
import { useLocations } from '@/hooks/useAssets';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dropBoxSchema, DropBoxSchemaData } from '@/schemas/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
import { Plus, Edit, Trash2, Archive } from 'lucide-react';
import type { DropBox } from '@/types/admin';

export const DropBoxesPage = () => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDropBox, setEditingDropBox] = useState<DropBox | null>(null);

  const { data, isLoading } = useDropBoxes({ limit: 100 });
  const { data: locationsData } = useLocations();
  const createDropBox = useCreateDropBox();
  const updateDropBox = useUpdateDropBox();
  const deleteDropBox = useDeleteDropBox();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DropBoxSchemaData>({
    resolver: zodResolver(dropBoxSchema),
    defaultValues: { is_active: true },
  });

  const locationOptions: SelectOption[] = [
    { value: '', label: 'Select location (optional)' },
    ...(locationsData?.map((l) => ({ value: String(l.id), label: l.name })) || []),
  ];

  const openModal = (dropBox?: DropBox) => {
    if (dropBox) {
      setEditingDropBox(dropBox);
      reset({
        name: dropBox.name,
        location_id: dropBox.location_id || undefined,
        description: dropBox.description || '',
        is_active: dropBox.is_active,
      });
    } else {
      setEditingDropBox(null);
      reset({ name: '', location_id: undefined, description: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDropBox(null);
    reset();
  };

  const onSubmit = async (data: DropBoxSchemaData) => {
    try {
      if (editingDropBox) {
        await updateDropBox.mutateAsync({ id: editingDropBox.id, data });
        showToast('success', 'Drop box updated');
      } else {
        await createDropBox.mutateAsync(data);
        showToast('success', 'Drop box created');
      }
      closeModal();
    } catch (error) {
      showToast('error', 'Failed to save drop box');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this drop box?')) return;
    try {
      await deleteDropBox.mutateAsync(id);
      showToast('success', 'Drop box deleted');
    } catch (error) {
      showToast('error', 'Failed to delete drop box');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-text">Drop Boxes</h1>
            <p className="text-sm text-text-muted mt-1">
              Manage equipment return drop boxes
            </p>
          </div>
          <Button onClick={() => openModal()}>
            <Plus size={16} strokeWidth={1.5} />
            Add Drop Box
          </Button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : data?.data.length === 0 ? (
          <EmptyState
            icon={<Archive size={48} strokeWidth={1.5} />}
            title="No drop boxes"
            description="Add your first drop box"
            action={
              <Button onClick={() => openModal()}>
                <Plus size={16} strokeWidth={1.5} />
                Add Drop Box
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data!.data.map((dropBox) => (
                <TableRow key={dropBox.id}>
                  <TableCell className="font-medium">{dropBox.name}</TableCell>
                  <TableCell className="text-text-muted">{dropBox.location_name || '—'}</TableCell>
                  <TableCell className="text-text-muted">{dropBox.description || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={dropBox.is_active ? 'success' : 'neutral'}>
                      {dropBox.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openModal(dropBox)}>
                        <Edit size={14} strokeWidth={1.5} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(dropBox.id)}>
                        <Trash2 size={14} strokeWidth={1.5} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingDropBox ? 'Edit Drop Box' : 'Add Drop Box'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" error={errors.name?.message} required {...register('name')} />
          <Select
            label="Location"
            options={locationOptions}
            error={errors.location_id?.message}
            defaultValue=""
            {...register('location_id', {
              setValueAs: (v) => (v === '' ? undefined : Number(v)),
            })}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Description</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 text-base border border-border rounded bg-background text-text placeholder:text-text-muted focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-primary"
              {...register('description')}
            />
            {errors.description && (
              <span className="text-sm text-error">{errors.description.message}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              className="w-4 h-4 rounded border-border"
              {...register('is_active')}
            />
            <label htmlFor="is_active" className="text-sm text-text">
              Active
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingDropBox ? 'Update' : 'Create'}
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
