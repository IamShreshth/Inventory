import { useState } from 'react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useAdmin';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, CategorySchemaData } from '@/schemas/admin';
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
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import type { Category } from '@/types/admin';

export const CategoriesPage = () => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data, isLoading } = useCategories({ limit: 100 });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CategorySchemaData>({
    resolver: zodResolver(categorySchema),
  });

  const categoryOptions: SelectOption[] = [
    { value: '', label: 'None (top level)' },
    ...(data?.data.map((c) => ({ value: String(c.id), label: c.name })) || []),
  ];

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      reset({ name: category.name, parent_id: category.parent_id || undefined });
    } else {
      setEditingCategory(null);
      reset({ name: '', parent_id: undefined });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = async (data: CategorySchemaData) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, data });
        showToast('success', 'Category updated');
      } else {
        await createCategory.mutateAsync(data);
        showToast('success', 'Category created');
      }
      closeModal();
    } catch (error) {
      showToast('error', 'Failed to save category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category? Child categories will also be affected.')) return;
    try {
      await deleteCategory.mutateAsync(id);
      showToast('success', 'Category deleted');
    } catch (error) {
      showToast('error', 'Failed to delete category');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-text">Categories</h1>
            <p className="text-sm text-text-muted mt-1">Organize assets by category</p>
          </div>
          <Button onClick={() => openModal()}>
            <Plus size={16} strokeWidth={1.5} />
            Add Category
          </Button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : data?.data.length === 0 ? (
          <EmptyState
            icon={<FolderTree size={48} strokeWidth={1.5} />}
            title="No categories"
            description="Add your first category"
            action={
              <Button onClick={() => openModal()}>
                <Plus size={16} strokeWidth={1.5} />
                Add Category
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Parent Category</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data!.data.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-text-muted">{category.parent_name || '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openModal(category)}>
                        <Edit size={14} strokeWidth={1.5} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
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
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" error={errors.name?.message} required {...register('name')} />
          <Select
            label="Parent Category"
            options={categoryOptions.filter((opt) => opt.value !== String(editingCategory?.id))}
            error={errors.parent_id?.message}
            defaultValue=""
            {...register('parent_id', {
              setValueAs: (v) => (v === '' ? undefined : Number(v)),
            })}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
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
