import { Select, SelectOption } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCategories, useLocations, useOrgUnits } from '@/hooks/useAssets';
import type { AssetStatus, TrackingType } from '@/types/asset';
import { X } from 'lucide-react';

interface AssetFiltersProps {
  filters: {
    q?: string;
    category_id?: number;
    location_id?: number;
    org_unit_id?: number;
    status?: AssetStatus;
    tracking?: TrackingType;
  };
  onFilterChange: (key: string, value: string | number | undefined) => void;
  onClearFilters: () => void;
}

export const AssetFilters = ({ filters, onFilterChange, onClearFilters }: AssetFiltersProps) => {
  const { data: categories } = useCategories();
  const { data: locations } = useLocations();
  const { data: orgUnits } = useOrgUnits();

  const categoryOptions: SelectOption[] = [
    { value: '', label: 'All Categories' },
    ...(categories?.map((c) => ({ value: String(c.id), label: c.name })) || []),
  ];

  const locationOptions: SelectOption[] = [
    { value: '', label: 'All Locations' },
    ...(locations?.map((l) => ({ value: String(l.id), label: l.name })) || []),
  ];

  const orgUnitOptions: SelectOption[] = [
    { value: '', label: 'All Org Units' },
    ...(orgUnits?.map((o) => ({ value: String(o.id), label: o.name })) || []),
  ];

  const statusOptions: SelectOption[] = [
    { value: '', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'issued', label: 'Issued' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'retired', label: 'Retired' },
  ];

  const trackingOptions: SelectOption[] = [
    { value: '', label: 'All Tracking Types' },
    { value: 'individual', label: 'Individual' },
    { value: 'quantity', label: 'Quantity' },
  ];

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  return (
    <div className="bg-surface border border-border rounded p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X size={16} strokeWidth={1.5} />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          placeholder="Search by name or tag..."
          value={filters.q || ''}
          onChange={(e) => onFilterChange('q', e.target.value || undefined)}
        />

        <Select
          options={categoryOptions}
          value={filters.category_id ? String(filters.category_id) : ''}
          onChange={(e) => onFilterChange('category_id', e.target.value ? Number(e.target.value) : undefined)}
        />

        <Select
          options={locationOptions}
          value={filters.location_id ? String(filters.location_id) : ''}
          onChange={(e) => onFilterChange('location_id', e.target.value ? Number(e.target.value) : undefined)}
        />

        <Select
          options={orgUnitOptions}
          value={filters.org_unit_id ? String(filters.org_unit_id) : ''}
          onChange={(e) => onFilterChange('org_unit_id', e.target.value ? Number(e.target.value) : undefined)}
        />

        <Select
          options={statusOptions}
          value={filters.status || ''}
          onChange={(e) => onFilterChange('status', e.target.value || undefined)}
        />

        <Select
          options={trackingOptions}
          value={filters.tracking || ''}
          onChange={(e) => onFilterChange('tracking', e.target.value || undefined)}
        />
      </div>
    </div>
  );
};
