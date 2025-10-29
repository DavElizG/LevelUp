import React from 'react';
import { cn } from '../../../shared/utils/themeUtils';
import { Skeleton, SkeletonCard } from '../../../components/shared/Skeleton';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className={cn(
      "min-h-screen pb-24",
      "bg-gradient-to-br from-orange-50 via-white to-purple-50",
      "dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
      "high-contrast:from-black high-contrast:via-black high-contrast:to-black"
    )}>
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-6 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-12 h-12 rounded-2xl" variant="rectangular" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-white/30" variant="text" />
                <Skeleton className="h-6 w-40 bg-white/40" variant="text" />
              </div>
            </div>
            <Skeleton className="w-10 h-10 rounded-full bg-white/30" variant="circular" />
          </div>
        </div>
      </div>

      <div className="px-6 max-w-md mx-auto">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-3 gap-3 -mt-8 mb-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} className="relative overflow-hidden">
              <Skeleton className="w-10 h-10 mb-2 rounded-full" variant="circular" />
              <Skeleton className="h-6 w-16 mb-1" variant="text" />
              <Skeleton className="h-3 w-12" variant="text" />
            </SkeletonCard>
          ))}
        </div>

        {/* Goal Card Skeleton */}
        <SkeletonCard className="mb-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-32" variant="text" />
            <Skeleton className="w-8 h-8 rounded-full" variant="circular" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-3 w-20" variant="text" />
                  <Skeleton className="h-3 w-16" variant="text" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" variant="rectangular" />
              </div>
            ))}
          </div>
        </SkeletonCard>

        {/* Quick Actions Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-6 w-40 mb-4" variant="text" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i}>
                <Skeleton className="w-12 h-12 mb-3 rounded-2xl" variant="rectangular" />
                <Skeleton className="h-4 w-24 mb-1" variant="text" />
                <Skeleton className="h-3 w-32" variant="text" />
              </SkeletonCard>
            ))}
          </div>
        </div>

        {/* Weekly Progress Skeleton */}
        <SkeletonCard>
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-5 w-32" variant="text" />
            <Skeleton className="h-4 w-16" variant="text" />
          </div>
          <div className="flex justify-between items-end h-32">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <Skeleton className="w-8 rounded-lg" style={{ height: `${Math.random() * 80 + 20}px` }} />
                <Skeleton className="h-3 w-6" variant="text" />
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
