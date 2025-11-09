import { type HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  count = 1,
  className = '',
  ...props
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const skeletonStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={skeletonStyle}
            {...props}
          />
        ))}
      </>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={skeletonStyle}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="flex-1" height={40} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <Skeleton height={24} width="60%" />
          <Skeleton height={16} count={3} />
          <div className="flex gap-2 mt-4">
            <Skeleton height={36} width={100} />
            <Skeleton height={36} width={100} />
          </div>
        </div>
      ))}
    </>
  );
}
