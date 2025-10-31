import React from 'react';
import { cn } from '../../../shared/utils/themeUtils';
import { Skeleton, SkeletonCard } from '../../../components/shared/Skeleton';

const ProfileSkeleton: React.FC = () => {
  return (
    <div className={cn(
      "min-h-screen pb-24",
      "bg-gradient-to-br from-orange-50 via-white to-purple-50",
      "dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
      "high-contrast:from-black high-contrast:via-black high-contrast:to-black"
    )}>
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-8 w-48 mb-2" variant="text" />
          <Skeleton className="h-4 w-64" variant="text" />
        </div>

        {/* Personal Info Card Skeleton */}
        <SkeletonCard className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-40" variant="text" />
            <Skeleton className="w-20 h-9 rounded-lg" variant="rectangular" />
          </div>
          
          <div className="space-y-4">
            {/* Name and Email */}
            {[1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20 mb-2" variant="text" />
                <Skeleton className="h-10 w-full rounded-lg" variant="rectangular" />
              </div>
            ))}
          </div>
        </SkeletonCard>

        {/* Physical Stats Card Skeleton */}
        <SkeletonCard className="mb-6">
          <Skeleton className="h-6 w-48 mb-6" variant="text" />
          
          <div className="grid grid-cols-2 gap-4">
            {/* Age, Height, Weight, Gender */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-3 w-16 mb-2" variant="text" />
                <Skeleton className="h-10 w-full rounded-lg" variant="rectangular" />
              </div>
            ))}
          </div>
        </SkeletonCard>

        {/* Fitness Goal Card Skeleton */}
        <SkeletonCard className="mb-6">
          <Skeleton className="h-6 w-40 mb-6" variant="text" />
          
          <div className="space-y-4">
            {/* Goal and Activity Level */}
            {[1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="h-3 w-24 mb-2" variant="text" />
                <Skeleton className="h-10 w-full rounded-lg" variant="rectangular" />
              </div>
            ))}
          </div>
        </SkeletonCard>

        {/* Settings Section Skeleton */}
        <SkeletonCard className="mb-6">
          <Skeleton className="h-6 w-32 mb-6" variant="text" />
          
          <div className="space-y-4">
            {/* Theme, Language, Notifications */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" variant="circular" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" variant="text" />
                    <Skeleton className="h-3 w-32" variant="text" />
                  </div>
                </div>
                <Skeleton className="w-12 h-6 rounded-full" variant="rectangular" />
              </div>
            ))}
          </div>
        </SkeletonCard>

        {/* Logout Button Skeleton */}
        <Skeleton className="h-12 w-full rounded-xl" variant="rectangular" />
      </div>
    </div>
  );
};

export default ProfileSkeleton;
