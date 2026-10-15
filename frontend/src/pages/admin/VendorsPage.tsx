import { useState } from 'react';
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '@/hooks/useAdmin';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vendorSchema, VendorSchemaData } from '@/schemas/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
import { Plus, Edit, Trash2, Store } from 'lucide-react';
import type { Vendor } from '@/types/admin';

export const VendorsPage = () => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const { data, isLoading } = useVendors({ limit: 100 });
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VendorSchemaData>({
    resolver: zodResolver(vendorSchema),
  });

  const openModal = (vendor?: Vendor) => {
    if (vendor) {
      setEditingVendor(vendor);
      reset({
        name: vendor.name,
        contact_person: vendor.contact_person || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
      });
    } else {
      setEditingVendor(null);
      reset({ name: '', contact_person: '', email: '', phone: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVendor(null);
    reset();
  };

  const onSubmit = async (data: VendorSchemaData) => {
    try {
      if (editingVendor) {
        await updateVendor.mutateAsync({ id: editingVendor.id, data });
        showToast('success', 'Vendor updated');
      } else {
        await createVendor.mutateAsync(data);
        showToast('success', 'Vendor created');
      }
      closeModal();
    } catch (error) {
      showToast('error', 'Failed to save vendor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this vendor?')) return;
    try {
      await deleteVendor.mutateAsync(id);
      showToast('success', 'Vendor deleted');
    } catch (error) {
      showToast('error', 'Failed to delete vendor');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-text">Vendors</h1>
            <p className="text-sm text-text-muted mt-1">Manage equipment suppliers</p>
          </div>
          <Button onClick={() => openModal()}>
            <Plus size={16} strokeWidth={1.5} />
            Add Vendor
          </Button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : data?.data.length === 0 ? (
          <EmptyState
            icon={<Store size={48} strokeWidth={1.5} />}
            title="No vendors"
            description="Add your first vendor"
            action={
              <Button onClick={() => openModal()}>
                <Plus size={16} strokeWidth={1.5} />
                Add Vendor
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data!.data.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell className="text-text-muted">{vendor.contact_person || '—'}</TableCell>
                  <TableCell className="text-text-muted">{vendor.email || '—'}</TableCell>
                  <TableCell className="text-text-muted">{vendor.phone || '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openModal(vendor)}>
                        <Edit size={14} strokeWidth={1.5} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(vendor.id)}>
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
        title={editingVendor ? 'Edit Vendor' : 'Add Vendor'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" error={errors.name?.message} required {...register('name')} />
          <Input
            label="Contact Person"
            error={errors.contact_person?.message}
            {...register('contact_person')}
          />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Address</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 text-base border border-border rounded bg-background text-text placeholder:text-text-muted focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-primary"
              {...register('address')}
            />
            {errors.address && (
              <span className="text-sm text-error">{errors.address.message}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingVendor ? 'Update' : 'Create'}
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
