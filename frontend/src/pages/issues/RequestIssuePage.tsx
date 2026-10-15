import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { issueRequestSchema, IssueRequestFormData } from '@/schemas/issue';
import { useRequestIssue } from '@/hooks/useIssues';
import { useAssets } from '@/hooks/useAssets';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { useToast } from '@/components/ui/useToast';
import { ArrowLeft } from 'lucide-react';
import type { ApiErrorResponse } from '@/types/api';

export const RequestIssuePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedAssetId, setSelectedAssetId] = useState<number | undefined>();

  const { data: assetsData } = useAssets({ limit: 100, status: 'available' });
  const requestIssue = useRequestIssue();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
  } = useForm<IssueRequestFormData>({
    resolver: zodResolver(issueRequestSchema),
  });

  const assetOptions: SelectOption[] = [
    { value: '', label: 'Select an asset' },
    ...(assetsData?.data.map((asset) => ({
      value: String(asset.id),
      label: `${asset.name} (${asset.asset_tag})${
        asset.tracking === 'quantity' ? ` - ${asset.quantity_available} available` : ''
      }`,
    })) || []),
  ];

  const selectedAsset = assetsData?.data.find((a) => a.id === selectedAssetId);

  const onSubmit = async (data: IssueRequestFormData) => {
    try {
      await requestIssue.mutateAsync(data);
      showToast('success', 'Issue request submitted successfully');
      navigate('/my-loans');
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const details = axiosError.response?.data?.error?.details;

      if (details) {
        details.forEach((detail) => {
          setError(detail.field as keyof IssueRequestFormData, {
            message: detail.issue,
          });
        });
      } else {
        showToast(
          'error',
          axiosError.response?.data?.error?.message || 'Failed to submit request'
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => navigate('/my-loans')} className="mb-4">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to My Loans
        </Button>
        <h1 className="text-xl font-medium text-text">Request Equipment</h1>
        <p className="text-sm text-text-muted mt-1">Submit a request to borrow equipment</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="bg-surface border border-border rounded p-6 space-y-4">
          <h2 className="text-base font-medium text-text">Request Details</h2>

          <Select
            label="Asset"
            options={assetOptions}
            error={errors.asset_id?.message}
            required
            defaultValue=""
            {...register('asset_id', {
              setValueAs: (v) => (v === '' ? undefined : Number(v)),
            })}
            onChange={(e) => {
              const value = e.target.value;
              const assetId = value ? Number(value) : undefined;
              setSelectedAssetId(assetId);
              setValue('asset_id', assetId as number);
              
              // Set default quantity based on asset tracking
              const asset = assetsData?.data.find((a) => a.id === assetId);
              if (asset?.tracking === 'individual') {
                setValue('quantity_requested', 1);
              }
            }}
          />

          {selectedAsset && (
            <div className="text-sm text-text-muted bg-background p-3 rounded">
              <div>
                <span className="font-medium">Available: </span>
                {selectedAsset.tracking === 'quantity'
                  ? `${selectedAsset.quantity_available} units`
                  : selectedAsset.status === 'available'
                  ? 'Yes'
                  : 'No'}
              </div>
              {selectedAsset.location_name && (
                <div>
                  <span className="font-medium">Location: </span>
                  {selectedAsset.location_name}
                </div>
              )}
            </div>
          )}

          <Input
            label="Quantity"
            type="number"
            min="1"
            max={selectedAsset?.tracking === 'quantity' ? selectedAsset.quantity_available : 1}
            error={errors.quantity_requested?.message}
            helperText={
              selectedAsset?.tracking === 'individual'
                ? 'This asset can only be borrowed individually'
                : undefined
            }
            required
            disabled={selectedAsset?.tracking === 'individual'}
            {...register('quantity_requested', {
              setValueAs: (v) => (v === '' ? undefined : Number(v)),
            })}
          />

          <div className="space-y-1">
            <label htmlFor="purpose" className="text-sm font-medium text-text">
              Purpose
            </label>
            <textarea
              id="purpose"
              rows={3}
              placeholder="Describe why you need this equipment..."
              className="w-full px-3 py-2 text-base border border-border rounded bg-background text-text placeholder:text-text-muted focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-primary"
              {...register('purpose')}
            />
            {errors.purpose && (
              <span className="text-sm text-error">{errors.purpose.message}</span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting || !selectedAssetId}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/my-loans')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
