
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const MonthlyTimeEntrySkeleton = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="py-3 px-6 bg-muted/30">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="shadow-sm">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-grow mr-4">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <div className="flex gap-1">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
