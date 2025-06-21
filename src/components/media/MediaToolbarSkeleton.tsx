
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const MediaToolbarSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 py-4 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
};
