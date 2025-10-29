import React from 'react';

const WorkoutSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
      {/* Header Image Skeleton */}
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>

      {/* Content Skeleton */}
      <div className="p-6">
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
        
        {/* Description Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>

        {/* Stats Row Skeleton */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-5 bg-gray-300 rounded w-3/4"></div>
          </div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-5 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>

        {/* Tags Skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>

        {/* Buttons Skeleton */}
        <div className="flex gap-3">
          <div className="flex-1 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
          <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export const WorkoutSkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <WorkoutSkeleton key={index} />
      ))}
    </div>
  );
};

export default WorkoutSkeleton;
