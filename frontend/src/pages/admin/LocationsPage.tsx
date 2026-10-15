import { useState } from 'react';
import {
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from '@/hooks/useAdmin';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { locationSchema, LocationSchemaData } from '@/schemas/admin';
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
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import type { Location } from '@/types/admin';

export const LocationsPage = () => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const { data, isLoading } = useLocations({ limit: 100 });
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LocationSchemaData>({
    resolver: zodResolver(locationSchema),
  });

  const openModal = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      reset({ name: location.name, description: location.description || '' });
    } else {
      setEditingLocation(null);
      reset({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLocation(null);
    reset();
  };

  const onSubmit = async (data: LocationSchemaData) => {
    try {
      if (editingLocation) {
        await updateLocation.mutateAsync({ id: editingLocation.id, data });
        showToast('success', 'Location updated');
      } else {
        await createLocation.mutateAsync(data);
        showToast('success', 'Location created');
      }
      closeModal();
    } catch (error) {
      showToast('error', 'Failed to save location');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this location?')) return;
    try {
      await deleteLocation.mutateAsync(id);
      showToast('success', 'Location deleted');
    } catch (error) {
      showToast('error', 'Failed to delete location');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-text">Locations</h1>
            <p className="text-sm text-text-muted mt-1">Manage physical locations</p>
          </div>
          <Button onClick={() => openModal()}>
            <Plus size={16} strokeWidth={1.5} />
            Add Location
          </Button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : data?.data.length === 0 ? (
          <EmptyState
            icon={<MapPin size={48} strokeWidth={1.5} />}
            title="No locations"
            description="Add your first location"
            action={
              <Button onClick={() => openModal()}>
                <Plus size={16} strokeWidth={1.5} />
                Add Location
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data!.data.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell className="text-text-muted">{location.description || '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openModal(location)}>
                        <Edit size={14} strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(location.id)}
                      >
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
        title={editingLocation ? 'Edit Location' : 'Add Location'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" error={errors.name?.message} required {...register('name')} />
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
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingLocation ? 'Update' : 'Create'}
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
