import type { Asset } from '@/types/asset';

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; label: string }[]
) {
  if (data.length === 0) return;

  const headers = columns.map((col) => col.label).join(',');
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col.key];
        if (value === null || value === undefined) return '';
        const str = String(value);
        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(',')
  );

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAssetsToCSV(assets: Asset[]) {
  // Cast to satisfy the generic constraint
  const data = assets as unknown as Record<string, unknown>[];
  exportToCSV(data, `assets-${new Date().toISOString().split('T')[0]}.csv`, [
    { key: 'id', label: 'ID' },
    { key: 'asset_tag', label: 'Asset Tag' },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'tracking', label: 'Tracking Type' },
    { key: 'quantity_total', label: 'Total Quantity' },
    { key: 'quantity_available', label: 'Available Quantity' },
    { key: 'status', label: 'Status' },
    { key: 'category_name', label: 'Category' },
    { key: 'location_name', label: 'Location' },
    { key: 'org_unit_name', label: 'Org Unit' },
    { key: 'created_at', label: 'Created At' },
    { key: 'updated_at', label: 'Updated At' },
  ]);
}
