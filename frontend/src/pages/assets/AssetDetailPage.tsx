import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAsset, useDeleteAsset } from '@/hooks/useAssets';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { AssetQRModal } from '@/components/assets/AssetQRModal';
import { useToast } from '@/components/ui/useToast';
import { ArrowLeft, Edit, Trash2, QrCode } from 'lucide-react';
import type { AssetStatus } from '@/types/asset';

const statusVariants: Record<AssetStatus, 'success' | 'warning' | 'error' | 'neutral'> = {
  available: 'success',
  issued: 'warning',
  maintenance: 'neutral',
  retired: 'error',
};

export const AssetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: asset, isLoading, error } = useAsset(id ? Number(id) : null);
  const deleteAsset = useDeleteAsset();

  const handleDelete = async () => {
    if (!asset || !confirm('Are you sure you want to delete this asset?')) return;

    setIsDeleting(true);
    try {
      await deleteAsset.mutateAsync(asset.id);
      showToast('success', 'Asset deleted successfully');
      navigate('/assets');
    } catch (error) {
      showToast('error', 'Failed to delete asset');
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-text mb-2">Asset not found</h2>
        <p className="text-sm text-text-muted mb-6">The asset you're looking for doesn't exist</p>
        <Button variant="secondary" onClick={() => navigate('/assets')}>
          Back to Assets
        </Button>
      </div>
    );
  }

  if (isLoading || !asset) {
    return (
      <div className="space-y-6">
        <Skeleton height="40px" />
        <div className="bg-surface border border-border rounded p-6 space-y-4">
          <Skeleton height="24px" width="200px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
          <Skeleton height="20px" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" onClick={() => navigate('/assets')} className="mb-4">
            <ArrowLeft size={16} strokeWidth={1.5} />
            Back to Assets
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-medium text-text">{asset.name}</h1>
                <Badge variant={statusVariants[asset.status]}>{asset.status}</Badge>
              </div>
              <p className="text-sm text-text-muted">Asset Tag: {asset.asset_tag}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIsQRModalOpen(true)}>
                <QrCode size={16} strokeWidth={1.5} />
                Generate QR
              </Button>
              <Button variant="secondary" onClick={() => navigate(`/assets/${asset.id}/edit`)}>
                <Edit size={16} strokeWidth={1.5} />
                Edit
              </Button>
              <Button variant="secondary" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 size={16} strokeWidth={1.5} />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded p-6">
          <h2 className="text-base font-medium text-text mb-4">Details</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-text-muted mb-1">Description</dt>
              <dd className="text-sm text-text">{asset.description || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-muted mb-1">Tracking Type</dt>
              <dd className="text-sm text-text capitalize">{asset.tracking}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-muted mb-1">Category</dt>
              <dd className="text-sm text-text">{asset.category_name || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-muted mb-1">Location</dt>
              <dd className="text-sm text-text">{asset.location_name || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-muted mb-1">Organization Unit</dt>
              <dd className="text-sm text-text">{asset.org_unit_name || '—'}</dd>
            </div>
            {asset.tracking === 'quantity' && (
              <>
                <div>
                  <dt className="text-sm text-text-muted mb-1">Total Quantity</dt>
                  <dd className="text-sm text-text">{asset.quantity_total}</dd>
                </div>
                <div>
                  <dt className="text-sm text-text-muted mb-1">Available Quantity</dt>
                  <dd className="text-sm text-text">{asset.quantity_available}</dd>
                </div>
              </>
            )}
            <div>
              <dt className="text-sm text-text-muted mb-1">Created</dt>
              <dd className="text-sm text-text">
                {new Date(asset.created_at).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-text-muted mb-1">Last Updated</dt>
              <dd className="text-sm text-text">
                {new Date(asset.updated_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <AssetQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        assetId={asset.id}
        assetName={asset.name}
        assetTag={asset.asset_tag}
      />
    </>
  );
};
