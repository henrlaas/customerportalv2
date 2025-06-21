
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export const MediaRecentlyUsedSkeleton: React.FC = () => {
  return (
    <div className="mb-8">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="mb-3 flex items-center justify-center">
                <Skeleton className="h-12 w-12 rounded" />
              </div>
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
