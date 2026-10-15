import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
  width?: string;
  height?: string;
}

export const Skeleton = ({
  className,
  variant = 'rect',
  width,
  height,
  ...props
}: SkeletonProps) => {
  const variants = {
    text: 'h-4 w-full',
    rect: 'w-full h-12',
    circle: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'bg-surface animate-pulse rounded',
        variants[variant],
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
};

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="w-full border border-border rounded overflow-hidden">
      <div className="bg-surface p-4 border-b border-border">
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="text" width="100px" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-border last:border-b-0">
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} variant="text" width="100px" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
