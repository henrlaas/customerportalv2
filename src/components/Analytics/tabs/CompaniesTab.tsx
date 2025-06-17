
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { ThemedMetricCard } from '../ThemedMetricCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Megaphone, Target, TrendingUp, Users } from 'lucide-react';

export const CompaniesTab = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getAnalyticsData,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-emerald-50/50 p-4 rounded-lg">
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

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="h-6 w-6 text-emerald-600" />
        <h2 className="text-2xl font-bold text-emerald-700">Companies & Clients</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <ThemedMetricCard 
          title="Total Companies" 
          value={analytics.totalCompanies}
          icon={Building2}
          theme="emerald"
          description="Active client companies"
        />
        <ThemedMetricCard 
          title="Marketing Clients" 
          value={analytics.marketingCompanies}
          icon={Megaphone}
          theme="emerald"
          description="Marketing service clients"
        />
        <ThemedMetricCard 
          title="Web Clients" 
          value={analytics.webCompanies}
          icon={Target}
          theme="emerald"
          description="Web development clients"
        />
        <ThemedMetricCard 
          title="Total MRR" 
          value={formatCurrency(analytics.totalMrr)}
          icon={TrendingUp}
          theme="emerald"
          description="Monthly recurring revenue"
        />
        <ThemedMetricCard 
          title="Company Contacts" 
          value={analytics.totalContacts}
          icon={Users}
          theme="emerald"
          description="Total contact persons"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white/70 p-6 rounded-lg border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-700 mb-4">Client Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-emerald-600">Marketing Clients</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-emerald-100 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(analytics.marketingCompanies / analytics.totalCompanies) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-emerald-700 font-medium">
                  {Math.round((analytics.marketingCompanies / analytics.totalCompanies) * 100)}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-600">Web Clients</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-emerald-100 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(analytics.webCompanies / analytics.totalCompanies) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-emerald-700 font-medium">
                  {Math.round((analytics.webCompanies / analytics.totalCompanies) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 p-6 rounded-lg border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-700 mb-4">Revenue Metrics</h3>
          <div className="space-y-3">
            <div>
              <span className="text-emerald-600 text-sm">Average MRR per Company</span>
              <div className="text-2xl font-bold text-emerald-700">
                {analytics.totalCompanies > 0 ? formatCurrency(analytics.totalMrr / analytics.totalCompanies) : formatCurrency(0)}
              </div>
            </div>
            <div>
              <span className="text-emerald-600 text-sm">Total Annual Value</span>
              <div className="text-xl font-semibold text-emerald-700">
                {formatCurrency(analytics.totalMrr * 12)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 p-6 rounded-lg border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-700 mb-4">Contact Insights</h3>
          <div className="space-y-3">
            <div>
              <span className="text-emerald-600 text-sm">Contacts per Company</span>
              <div className="text-2xl font-bold text-emerald-700">
                {analytics.totalCompanies > 0 ? Math.round(analytics.totalContacts / analytics.totalCompanies * 10) / 10 : 0}
              </div>
            </div>
            <div>
              <span className="text-emerald-600 text-sm">Total Contacts</span>
              <div className="text-xl font-semibold text-emerald-700">
                {analytics.totalContacts}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
