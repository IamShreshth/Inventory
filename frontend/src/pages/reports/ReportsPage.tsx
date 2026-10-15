import { useState } from 'react';
import { useGenerateReport } from '@/hooks/useReports';
import { useCategories, useLocations, useOrgUnits } from '@/hooks/useAssets';
import { Button } from '@/components/ui/Button';
import { Select, SelectOption } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { useToast } from '@/components/ui/useToast';
import { exportToCSV } from '@/lib/csv-export';
import { BarChart3, Download } from 'lucide-react';
import type { ReportType, ReportResult } from '@/types/report';

export const ReportsPage = () => {
  const { showToast } = useToast();
  const [reportType, setReportType] = useState<ReportType>('assets_by_category');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [locationId, setLocationId] = useState<number | undefined>();
  const [orgUnitId, setOrgUnitId] = useState<number | undefined>();
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);

  const { data: categories } = useCategories();
  const { data: locations } = useLocations();
  const { data: orgUnits } = useOrgUnits();
  const generateReport = useGenerateReport();

  const reportTypeOptions: SelectOption[] = [
    { value: 'assets_by_category', label: 'Assets by Category' },
    { value: 'assets_by_location', label: 'Assets by Location' },
    { value: 'issues_by_borrower', label: 'Issues by Borrower' },
    { value: 'overdue_report', label: 'Overdue Report' },
    { value: 'utilization_report', label: 'Utilization Report' },
  ];

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

  const handleGenerate = async () => {
    try {
      const result = await generateReport.mutateAsync({
        report_type: reportType,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        category_id: categoryId,
        location_id: locationId,
        org_unit_id: orgUnitId,
      });
      setReportResult(result);
      showToast('success', 'Report generated successfully');
    } catch (error) {
      showToast('error', 'Failed to generate report');
    }
  };

  const handleExport = () => {
    if (!reportResult) return;
    exportToCSV(
      reportResult.rows,
      `${reportType}-${new Date().toISOString().split('T')[0]}.csv`,
      reportResult.columns
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-text">Reports</h1>
          <p className="text-sm text-text-muted mt-1">Generate and export system reports</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded p-4 space-y-4">
        <h2 className="text-base font-medium text-text">Report Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Report Type"
            options={reportTypeOptions}
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
          />

          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <Select
            label="Category"
            options={categoryOptions}
            value={categoryId ? String(categoryId) : ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
          />

          <Select
            label="Location"
            options={locationOptions}
            value={locationId ? String(locationId) : ''}
            onChange={(e) => setLocationId(e.target.value ? Number(e.target.value) : undefined)}
          />

          <Select
            label="Org Unit"
            options={orgUnitOptions}
            value={orgUnitId ? String(orgUnitId) : ''}
            onChange={(e) => setOrgUnitId(e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <Button onClick={handleGenerate} disabled={generateReport.isPending}>
          <BarChart3 size={16} strokeWidth={1.5} />
          {generateReport.isPending ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      {reportResult && (
        <div className="bg-background border border-border rounded">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h2 className="text-base font-medium text-text">{reportResult.title}</h2>
              <p className="text-xs text-text-muted mt-1">
                Generated: {new Date(reportResult.generated_at).toLocaleString()}
              </p>
            </div>
            <Button variant="secondary" onClick={handleExport}>
              <Download size={16} strokeWidth={1.5} />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {reportResult.columns.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportResult.rows.map((row, idx) => (
                  <TableRow key={idx}>
                    {reportResult.columns.map((col) => (
                      <TableCell key={col.key}>{row[col.key] ?? '—'}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {reportResult && reportResult.rows.length === 0 && (
        <div className="text-center py-12 text-text-muted">No data found for this report</div>
      )}
    </div>
  );
};
