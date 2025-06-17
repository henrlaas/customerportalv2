
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { ThemedMetricCard } from '../ThemedMetricCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Megaphone, Target } from 'lucide-react';

const COLORS = ['#06B6D4', '#5FA39D', '#F2FCE2', '#8B5CF6', '#84CC16', '#F59E0B'];

export const CampaignsTab = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getAnalyticsData,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-teal-50/50 p-4 rounded-lg">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <Megaphone className="h-6 w-6 text-teal-600" />
        <h2 className="text-2xl font-bold text-teal-700">Campaigns & Advertising</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ThemedMetricCard 
          title="Total Campaigns" 
          value={analytics.totalCampaigns}
          icon={Megaphone}
          theme="teal"
          description="Marketing campaigns"
        />
        <ThemedMetricCard 
          title="Total Adsets" 
          value={analytics.totalAdsets}
          icon={Target}
          theme="teal"
          description="Ad targeting groups"
        />
        <ThemedMetricCard 
          title="Total Ads" 
          value={analytics.totalAds}
          icon={Target}
          theme="teal"
          description="Individual advertisements"
        />
      </div>
      
      {analytics.platformDistribution.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/70 border-teal-200">
            <CardHeader>
              <CardTitle className="text-teal-700">Platform Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.platformDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ platform, count }) => `${platform}: ${count}`}
                    >
                      {analytics.platformDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white/70 p-6 rounded-lg border border-teal-200">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">Campaign Metrics</h3>
            <div className="space-y-4">
              <div>
                <span className="text-teal-600 text-sm">Ads per Campaign</span>
                <div className="text-2xl font-bold text-teal-700">
                  {analytics.totalCampaigns > 0 ? Math.round((analytics.totalAds / analytics.totalCampaigns) * 10) / 10 : 0}
                </div>
              </div>
              <div>
                <span className="text-teal-600 text-sm">Adsets per Campaign</span>
                <div className="text-xl font-semibold text-teal-700">
                  {analytics.totalCampaigns > 0 ? Math.round((analytics.totalAdsets / analytics.totalCampaigns) * 10) / 10 : 0}
                </div>
              </div>
              <div>
                <span className="text-teal-600 text-sm">Platform Diversity</span>
                <div className="text-lg font-semibold text-teal-700">
                  {analytics.platformDistribution.length} platforms
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
