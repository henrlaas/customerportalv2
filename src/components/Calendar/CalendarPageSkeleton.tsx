
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CalendarPageSkeletonProps {
  viewMode: 'calendar' | 'list';
}

export const CalendarPageSkeleton: React.FC<CalendarPageSkeletonProps> = ({ viewMode }) => {
  const weekDays = Array(7).fill(0);
  const calendarWeeks = Array(6).fill(0);
  const monthlyCards = Array(6).fill(0);

  return (
    <div className="container p-6 mx-auto">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Toggle Skeleton */}
          <div className="flex items-center border rounded-lg p-1">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16 ml-1" />
          </div>

          {/* Month Navigation Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </div>

      {/* Monthly Overview Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {monthlyCards.map((_, index) => (
          <Card key={index} className="border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-7 w-8" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar or List View Skeleton */}
      {viewMode === 'calendar' ? (
        <Card className="p-6">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-4 mb-4">
            {weekDays.map((_, day) => (
              <div key={day} className="text-center py-2">
                <Skeleton className="h-5 w-8 mx-auto" />
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-4">
            {calendarWeeks.map((_, weekIndex) => 
              weekDays.map((_, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className="min-h-[120px] p-2 border rounded-lg"
                >
                  <Skeleton className="h-4 w-4 mb-2" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {Array(4).fill(0).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {Array(3).fill(0).map((_, eventIndex) => (
                    <div
                      key={eventIndex}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
