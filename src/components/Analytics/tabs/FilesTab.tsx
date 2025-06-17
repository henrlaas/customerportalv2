
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { ThemedMetricCard } from '../ThemedMetricCard';
import { Skeleton } from '@/components/ui/skeleton';
import { HardDrive } from 'lucide-react';

export const FilesTab = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getAnalyticsData,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-amber-50/50 p-4 rounded-lg">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const averageFileSize = analytics.totalFiles > 0 ? analytics.totalFileSize / analytics.totalFiles : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <HardDrive className="h-6 w-6 text-amber-600" />
        <h2 className="text-2xl font-bold text-amber-700">Files & Storage</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ThemedMetricCard 
          title="Total Files" 
          value={analytics.totalFiles}
          icon={HardDrive}
          theme="amber"
          description="Media and documents"
        />
        <ThemedMetricCard 
          title="Total Storage Used" 
          value={formatFileSize(analytics.totalFileSize)}
          icon={HardDrive}
          theme="amber"
          description="Storage consumption"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white/70 p-6 rounded-lg border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-700 mb-4">Storage Metrics</h3>
          <div className="space-y-4">
            <div>
              <span className="text-amber-600 text-sm">Average File Size</span>
              <div className="text-2xl font-bold text-amber-700">
                {formatFileSize(averageFileSize)}
              </div>
            </div>
            <div>
              <span className="text-amber-600 text-sm">Storage per File</span>
              <div className="text-xl font-semibold text-amber-700">
                {formatFileSize(averageFileSize)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 p-6 rounded-lg border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-700 mb-4">File Management</h3>
          <div className="space-y-4">
            <div>
              <span className="text-amber-600 text-sm">Total Files</span>
              <div className="text-2xl font-bold text-amber-700">
                {analytics.totalFiles.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-amber-600 text-sm">Storage Efficiency</span>
              <div className="text-xl font-semibold text-amber-700">
                {analytics.totalFiles > 0 ? 'Optimized' : 'No Data'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
