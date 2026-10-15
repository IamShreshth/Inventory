import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssets } from '@/hooks/useAssets';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { AssetsTable } from '@/components/assets/AssetsTable';
import { AssetFilters } from '@/components/assets/AssetFilters';
import { exportAssetsToCSV } from '@/lib/csv-export';
import { Plus, Download, Package } from 'lucide-react';
import type { AssetFilters as AssetFiltersType } from '@/types/asset';

export const AssetsListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState<AssetFiltersType & { q?: string }>({});

  const { data, isLoading, error } = useAssets({ page, limit, ...filters });

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleExport = () => {
    if (data?.data) {
      exportAssetsToCSV(data.data);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-text mb-2">Failed to load assets</h2>
        <p className="text-sm text-text-muted">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Assets</h1>
          <p className="text-base text-text-muted mt-2">
            Manage equipment and resources inventory
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExport} disabled={!data?.data.length}>
            <Download size={18} strokeWidth={2} />
            Export CSV
          </Button>
          <Button onClick={() => navigate('/assets/new')}>
            <Plus size={18} strokeWidth={2} />
            Add Asset
          </Button>
        </div>
      </div>

      <AssetFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : data?.data.length === 0 ? (
        <EmptyState
          icon={<Package size={48} strokeWidth={1.5} />}
          title="No assets found"
          description="Get started by adding your first asset"
          action={
            <Button onClick={() => navigate('/assets/new')}>
              <Plus size={18} strokeWidth={2} />
              Add Asset
            </Button>
          }
        />
      ) : (
        <>
          <AssetsTable assets={data!.data} />
          <Pagination
            currentPage={page}
            totalPages={data!.meta.pages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};
