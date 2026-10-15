import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

const variantStyles = {
  default: 'bg-background hover:shadow-md',
  success: 'bg-success-light border-success/30 hover:shadow-md hover:shadow-success/10',
  warning: 'bg-warning-light border-warning/30 hover:shadow-md hover:shadow-warning/10',
  error: 'bg-error-light border-error/30 hover:shadow-md hover:shadow-error/10',
};

const iconStyles = {
  default: 'bg-primary-light text-primary',
  success: 'bg-success text-background',
  warning: 'bg-warning text-background',
  error: 'bg-error text-background',
};

export const SummaryCard = ({ title, value, icon, variant = 'default', className }: SummaryCardProps) => {
  return (
    <div
      className={cn(
        'border border-border rounded-xl p-6 shadow-sm transition-all duration-200 hover:scale-[1.02]',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-3 rounded-lg shadow-sm', iconStyles[variant])}>{icon}</div>
      </div>
      <div>
        <div className="text-3xl font-semibold text-text mb-1">{value}</div>
        <div className="text-sm font-medium text-text-muted">{title}</div>
      </div>
    </div>
  );
};
