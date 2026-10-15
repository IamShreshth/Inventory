import { useState } from 'react';
import { useUsers } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/Badge';
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
import { Users as UsersIcon } from 'lucide-react';

export const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const { data, isLoading } = useUsers({ page, limit });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-text">Users</h1>
        <p className="text-sm text-text-muted mt-1">Manage system users and roles</p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : data?.data.length === 0 ? (
        <EmptyState
          icon={<UsersIcon size={48} strokeWidth={1.5} />}
          title="No users"
          description="No users found"
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Roles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data!.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell className="text-text-muted">{user.email}</TableCell>
                  <TableCell className="text-text-muted">{user.username}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="neutral">
                          {role.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
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
