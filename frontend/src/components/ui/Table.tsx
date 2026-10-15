import { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export const Table = ({ children, className }: TableProps) => {
  return (
    <div className={cn('w-full overflow-x-auto border border-border rounded-lg shadow-sm', className)}>
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
};

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export const TableHeader = ({ children, className }: TableHeaderProps) => {
  return (
    <thead className={cn('bg-surface/80 backdrop-blur-sm sticky top-0 z-10', className)}>
      {children}
    </thead>
  );
};

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export const TableBody = ({ children, className }: TableBodyProps) => {
  return <tbody className={cn('bg-background', className)}>{children}</tbody>;
};

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TableRow = ({ children, className, onClick }: TableRowProps) => {
  return (
    <tr
      className={cn(
        'border-b border-border last:border-b-0 transition-colors',
        onClick && 'cursor-pointer hover:bg-surface/50',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export const TableHead = ({ children, className, ...props }: TableHeadProps) => {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-sm font-semibold text-text border-b-2 border-border',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export const TableCell = ({ children, className, ...props }: TableCellProps) => {
  return (
    <td className={cn('px-4 py-3.5 text-sm text-text', className)} {...props}>
      {children}
    </td>
  );
};
