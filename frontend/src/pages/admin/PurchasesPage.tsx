import { useState } from 'react';
import { usePurchases } from '@/hooks/useAdmin';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { ShoppingCart } from 'lucide-react';

export const PurchasesPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data, isLoading } = usePurchases({ page, limit });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-text">Purchases</h1>
        <p className="text-sm text-text-muted mt-1">Purchase orders and invoices</p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : data?.data.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={48} strokeWidth={1.5} />}
          title="No purchases"
          description="Purchase records will appear here"
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data!.data.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">
                    {purchase.invoice_number || `#${purchase.id}`}
                  </TableCell>
                  <TableCell className="text-text-muted">{purchase.vendor_name || '—'}</TableCell>
                  <TableCell className="text-text-muted">
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${purchase.total_amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination currentPage={page} totalPages={data!.meta.pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};
