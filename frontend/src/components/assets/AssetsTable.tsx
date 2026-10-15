import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import type { Asset, AssetStatus } from '@/types/asset';

interface AssetsTableProps {
  assets: Asset[];
}

const statusVariants: Record<AssetStatus, 'success' | 'warning' | 'error' | 'neutral'> = {
  available: 'success',
  issued: 'warning',
  maintenance: 'neutral',
  retired: 'error',
};

export const AssetsTable = ({ assets }: AssetsTableProps) => {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset Tag</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Tracking</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map((asset) => (
          <TableRow key={asset.id} onClick={() => navigate(`/assets/${asset.id}`)}>
            <TableCell className="font-medium">{asset.asset_tag}</TableCell>
            <TableCell>{asset.name}</TableCell>
            <TableCell className="text-text-muted">{asset.category_name || '—'}</TableCell>
            <TableCell className="text-text-muted">{asset.location_name || '—'}</TableCell>
            <TableCell>
              <span className="text-xs text-text-muted capitalize">{asset.tracking}</span>
            </TableCell>
            <TableCell>
              {asset.tracking === 'quantity' ? (
                <span className="text-sm">
                  {asset.quantity_available} / {asset.quantity_total}
                </span>
              ) : (
                <span className="text-sm text-text-muted">—</span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={statusVariants[asset.status]}>{asset.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
