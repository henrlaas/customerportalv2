
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { ThemedMetricCard } from '../ThemedMetricCard';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';

export const DealsTab = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getAnalyticsData,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-rose-50/50 p-4 rounded-lg">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0
    }).format(value);
  };

  const averageDealValue = analytics.totalDeals > 0 ? analytics.totalDealsValue / analytics.totalDeals : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6 text-rose-600" />
        <h2 className="text-2xl font-bold text-rose-700">Deals Overview</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ThemedMetricCard 
          title="Total Deals" 
          value={analytics.totalDeals}
          icon={TrendingUp}
          theme="rose"
          description="Sales opportunities"
        />
        <ThemedMetricCard 
          title="Total Value" 
          value={formatCurrency(analytics.totalDealsValue)}
          icon={TrendingUp}
          theme="rose"
          description="Pipeline value"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white/70 p-6 rounded-lg border border-rose-200">
          <h3 className="text-lg font-semibold text-rose-700 mb-4">Deal Metrics</h3>
          <div className="space-y-4">
            <div>
              <span className="text-rose-600 text-sm">Average Deal Value</span>
              <div className="text-2xl font-bold text-rose-700">
                {formatCurrency(averageDealValue)}
              </div>
            </div>
            <div>
              <span className="text-rose-600 text-sm">Total Pipeline</span>
              <div className="text-xl font-semibold text-rose-700">
                {formatCurrency(analytics.totalDealsValue)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 p-6 rounded-lg border border-rose-200">
          <h3 className="text-lg font-semibold text-rose-700 mb-4">Performance</h3>
          <div className="space-y-4">
            <div>
              <span className="text-rose-600 text-sm">Active Deals</span>
              <div className="text-2xl font-bold text-rose-700">
                {analytics.totalDeals}
              </div>
            </div>
            <div>
              <span className="text-rose-600 text-sm">Pipeline Health</span>
              <div className="text-xl font-semibold text-rose-700">
                {analytics.totalDeals > 0 ? 'Strong' : 'Needs Attention'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
