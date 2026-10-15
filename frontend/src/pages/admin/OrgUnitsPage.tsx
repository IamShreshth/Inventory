import { useState } from 'react';
import {
  useOrgUnits,
  useCreateOrgUnit,
  useUpdateOrgUnit,
  useDeleteOrgUnit,
} from '@/hooks/useAdmin';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orgUnitSchema, OrgUnitSchemaData } from '@/schemas/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
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
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import type { OrgUnit } from '@/types/admin';

export const OrgUnitsPage = () => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrgUnit, setEditingOrgUnit] = useState<OrgUnit | null>(null);

  const { data, isLoading } = useOrgUnits({ limit: 100 });
  const createOrgUnit = useCreateOrgUnit();
  const updateOrgUnit = useUpdateOrgUnit();
  const deleteOrgUnit = useDeleteOrgUnit();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OrgUnitSchemaData>({
    resolver: zodResolver(orgUnitSchema),
  });

  const orgUnitOptions: SelectOption[] = [
    { value: '', label: 'None (top level)' },
    ...(data?.data.map((o) => ({ value: String(o.id), label: o.name })) || []),
  ];

  const openModal = (orgUnit?: OrgUnit) => {
    if (orgUnit) {
      setEditingOrgUnit(orgUnit);
      reset({ name: orgUnit.name, parent_id: orgUnit.parent_id || undefined });
    } else {
      setEditingOrgUnit(null);
      reset({ name: '', parent_id: undefined });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOrgUnit(null);
    reset();
  };

  const onSubmit = async (data: OrgUnitSchemaData) => {
    try {
      if (editingOrgUnit) {
        await updateOrgUnit.mutateAsync({ id: editingOrgUnit.id, data });
        showToast('success', 'Org unit updated');
      } else {
        await createOrgUnit.mutateAsync(data);
        showToast('success', 'Org unit created');
      }
      closeModal();
    } catch (error) {
      showToast('error', 'Failed to save org unit');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this org unit?')) return;
    try {
      await deleteOrgUnit.mutateAsync(id);
      showToast('success', 'Org unit deleted');
    } catch (error) {
      showToast('error', 'Failed to delete org unit');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-text">Organization Units</h1>
            <p className="text-sm text-text-muted mt-1">Manage organizational structure</p>
          </div>
          <Button onClick={() => openModal()}>
            <Plus size={16} strokeWidth={1.5} />
            Add Org Unit
          </Button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : data?.data.length === 0 ? (
          <EmptyState
            icon={<Building2 size={48} strokeWidth={1.5} />}
            title="No org units"
            description="Add your first org unit"
            action={
              <Button onClick={() => openModal()}>
                <Plus size={16} strokeWidth={1.5} />
                Add Org Unit
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Parent Unit</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data!.data.map((orgUnit) => (
                <TableRow key={orgUnit.id}>
                  <TableCell className="font-medium">{orgUnit.name}</TableCell>
                  <TableCell className="text-text-muted">{orgUnit.parent_name || '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openModal(orgUnit)}>
                        <Edit size={14} strokeWidth={1.5} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(orgUnit.id)}>
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
        title={editingOrgUnit ? 'Edit Org Unit' : 'Add Org Unit'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" error={errors.name?.message} required {...register('name')} />
          <Select
            label="Parent Unit"
            options={orgUnitOptions.filter((opt) => opt.value !== String(editingOrgUnit?.id))}
            error={errors.parent_id?.message}
            defaultValue=""
            {...register('parent_id', {
              setValueAs: (v) => (v === '' ? undefined : Number(v)),
            })}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingOrgUnit ? 'Update' : 'Create'}
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
