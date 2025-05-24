
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DealKanbanViewSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto">
      {Array(6).fill(0).map((_, stageIndex) => (
        <div key={`stage-skeleton-${stageIndex}`} className="flex flex-col h-full min-w-[250px]">
          <div className="bg-muted p-3 rounded-t-lg">
            <Skeleton className="h-5 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex-1 p-2 bg-muted/50 rounded-b-lg min-h-[500px]">
            <div className="space-y-2">
              {Array(3).fill(0).map((_, dealIndex) => (
                <Card key={`deal-skeleton-${stageIndex}-${dealIndex}`} className="bg-background">
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-16" />
                        <div className="flex -space-x-1">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
