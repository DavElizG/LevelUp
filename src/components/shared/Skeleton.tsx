import React from 'react';
import { cn } from '../../shared/utils/themeUtils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'rectangular',
  animation = 'pulse',
  style
}) => {
  const baseClasses = cn(
    "bg-gray-200 dark:bg-gray-700 high-contrast:bg-gray-600",
    animation === 'pulse' && "animate-pulse",
    animation === 'wave' && "animate-shimmer",
    variant === 'circular' && "rounded-full",
    variant === 'text' && "rounded-md h-4",
    variant === 'rectangular' && "rounded-lg"
  );

  return <div className={cn(baseClasses, className)} style={style} />;
};

interface SkeletonCardProps {
  className?: string;
  children?: React.ReactNode;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className, children }) => {
  return (
    <div className={cn(
      "p-4 rounded-2xl border",
      "bg-white/80 border-gray-200",
      "dark:bg-gray-800/80 dark:border-gray-700",
      "high-contrast:bg-gray-900 high-contrast:border-gray-600",
      "backdrop-blur-sm shadow-sm",
      className
    )}>
      {children}
    </div>
  );
};

export default Skeleton;
