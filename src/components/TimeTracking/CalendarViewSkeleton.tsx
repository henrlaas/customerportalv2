
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CalendarViewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar column */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center space-x-1">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Calendar header */}
              <div className="grid grid-cols-7 gap-1">
                {Array(7).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-8" />
                ))}
              </div>
              {/* Calendar days */}
              {Array(6).fill(0).map((_, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1">
                  {Array(7).fill(0).map((_, dayIndex) => (
                    <Skeleton key={dayIndex} className="h-8 w-8" />
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Entries list column */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array(3).fill(0).map((_, entryIndex) => (
                <Card key={`calendar-entry-skeleton-${entryIndex}`} className="shadow-sm">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
