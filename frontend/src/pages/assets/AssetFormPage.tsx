import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import {
  useAsset,
  useCreateAsset,
  useUpdateAsset,
  useCategories,
  useLocations,
  useOrgUnits,
} from '@/hooks/useAssets';
import { assetSchema, AssetFormData } from '@/schemas/asset';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/useToast';
import { ArrowLeft } from 'lucide-react';
import type { ApiErrorResponse } from '@/types/api';

export const AssetFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditing = id !== 'new';

  const { data: asset, isLoading: loadingAsset } = useAsset(isEditing ? Number(id) : null);
  const { data: categories } = useCategories();
  const { data: locations } = useLocations();
  const { data: orgUnits } = useOrgUnits();

  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      tracking: 'individual',
      quantity_total: 1,
      status: 'available',
    },
  });

  const [trackingType, setTrackingType] = useState<'individual' | 'quantity'>(
    asset?.tracking || 'individual'
  );

  useEffect(() => {
    if (asset) {
      reset({
        name: asset.name,
        description: asset.description || '',
        asset_tag: asset.asset_tag,
        tracking: asset.tracking,
        quantity_total: asset.quantity_total,
        category_id: asset.category_id || undefined,
        location_id: asset.location_id || undefined,
        org_unit_id: asset.org_unit_id || undefined,
        status: asset.status,
      });
    }
  }, [asset, reset]);

  const onSubmit = async (data: AssetFormData) => {
    try {
      // Convert string inputs to numbers
      const payload = {
        ...data,
        quantity_total: Number(data.quantity_total),
        category_id: data.category_id ? Number(data.category_id) : undefined,
        location_id: data.location_id ? Number(data.location_id) : undefined,
        org_unit_id: data.org_unit_id ? Number(data.org_unit_id) : undefined,
        purchase_id: data.purchase_id ? Number(data.purchase_id) : undefined,
      };

      if (isEditing) {
        await updateAsset.mutateAsync({ id: Number(id), data: payload });
        showToast('success', 'Asset updated successfully');
      } else {
        const created = await createAsset.mutateAsync(payload);
        showToast('success', 'Asset created successfully');
        navigate(`/assets/${created.id}`);
        return;
      }
      navigate(`/assets/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const details = axiosError.response?.data?.error?.details;

      if (details) {
        details.forEach((detail) => {
          setError(detail.field as keyof AssetFormData, {
            message: detail.issue,
          });
        });
      } else {
        showToast(
          'error',
          axiosError.response?.data?.error?.message || 'Failed to save asset'
        );
      }
    }
  };

  const categoryOptions: SelectOption[] = [
    { value: '', label: 'Select category' },
    ...(categories?.map((c) => ({ value: String(c.id), label: c.name })) || []),
  ];

  const locationOptions: SelectOption[] = [
    { value: '', label: 'Select location' },
    ...(locations?.map((l) => ({ value: String(l.id), label: l.name })) || []),
  ];

  const orgUnitOptions: SelectOption[] = [
    { value: '', label: 'Select org unit' },
    ...(orgUnits?.map((o) => ({ value: String(o.id), label: o.name })) || []),
  ];

  const trackingOptions: SelectOption[] = [
    { value: 'individual', label: 'Individual (Quantity = 1)' },
    { value: 'quantity', label: 'Quantity (Track inventory)' },
  ];

  const statusOptions: SelectOption[] = [
    { value: 'available', label: 'Available' },
    { value: 'issued', label: 'Issued' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'retired', label: 'Retired' },
  ];

  if (isEditing && loadingAsset) {
    return (
      <div className="space-y-6">
        <Skeleton height="40px" />
        <div className="space-y-4">
          <Skeleton height="80px" />
          <Skeleton height="80px" />
          <Skeleton height="80px" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => navigate('/assets')} className="mb-4">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Assets
        </Button>
        <h1 className="text-xl font-medium text-text">
          {isEditing ? 'Edit Asset' : 'Add New Asset'}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {isEditing ? 'Update asset information' : 'Create a new asset in the inventory'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="bg-surface border border-border rounded p-6 space-y-4">
          <h2 className="text-base font-medium text-text">Basic Information</h2>

          <Input
            label="Asset Name"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <Input
            label="Asset Tag"
            helperText="Unique identifier for this asset"
            error={errors.asset_tag?.message}
            required
            {...register('asset_tag')}
          />

          <div className="space-y-1">
            <label htmlFor="description" className="text-sm font-medium text-text">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full px-3 py-2 text-base border border-border rounded bg-background text-text placeholder:text-text-muted focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-primary"
              {...register('description')}
            />
            {errors.description && (
              <span className="text-sm text-error">{errors.description.message}</span>
            )}
          </div>

          <Select
            label="Tracking Type"
            options={trackingOptions}
            error={errors.tracking?.message}
            required
            {...register('tracking')}
            onChange={(e) => {
              const value = e.target.value as 'individual' | 'quantity';
              setTrackingType(value);
              register('tracking').onChange(e);
            }}
          />

          {trackingType === 'quantity' && (
            <Input
              label="Total Quantity"
              type="number"
              min="1"
              error={errors.quantity_total?.message}
              required
              {...register('quantity_total', {
                setValueAs: (v) => (v === '' ? undefined : Number(v)),
              })}
            />
          )}

          <Select
            label="Status"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        <div className="bg-surface border border-border rounded p-6 space-y-4">
          <h2 className="text-base font-medium text-text">Classification</h2>

          <Select
            label="Category"
            options={categoryOptions}
            error={errors.category_id?.message}
            defaultValue=""
            {...register('category_id', {
              setValueAs: (v) => (v === '' ? undefined : Number(v)),
            })}
          />

          <Select
            label="Location"
            options={locationOptions}
            error={errors.location_id?.message}
            defaultValue=""
            {...register('location_id', {
              setValueAs: (v) => (v === '' ? undefined : Number(v)),
            })}
          />

          <Select
            label="Organization Unit"
            options={orgUnitOptions}
            error={errors.org_unit_id?.message}
            defaultValue=""
            {...register('org_unit_id', {
              setValueAs: (v) => (v === '' ? undefined : Number(v)),
            })}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Asset' : 'Create Asset'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(isEditing ? `/assets/${id}` : '/assets')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
