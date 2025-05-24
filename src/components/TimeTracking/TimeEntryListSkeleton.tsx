
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TimeEntryListSkeleton() {
  return (
    <div className="space-y-6">
      {Array(3).fill(0).map((_, weekIndex) => (
        <Card key={`week-skeleton-${weekIndex}`} className="shadow-sm">
          <CardHeader className="py-2 px-6 bg-muted/30">
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {Array(4).fill(0).map((_, entryIndex) => (
              <Card key={`entry-skeleton-${weekIndex}-${entryIndex}`} className="shadow-sm">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Left side - Task description and metadata */}
                    <div className="flex-grow mr-4">
                      <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-5 w-48" />
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3.5 w-3.5" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3.5 w-3.5" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3.5 w-3.5" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Center - Badge */}
                    <div className="flex items-center self-center mx-3">
                      <Skeleton className="h-6 w-20" />
                    </div>
                    
                    {/* Middle - Date and time information */}
                    <div className="flex items-center gap-6 mr-4">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3.5 w-3.5" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3.5 w-3.5" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-4 w-12" />
                    </div>
                    
                    {/* Right side - Actions */}
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
