
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, CircleDollarSign, Target, TrendingDown } from 'lucide-react';

export const MyDealsCard = () => {
  const { user } = useAuth();

  const { data: dealStats, isLoading } = useQuery({
    queryKey: ['user-deal-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, open: 0, closed: 0, totalValue: 0 };

      // Get deals assigned to the current user
      const { data: deals, error } = await supabase
        .from('deals')
        .select(`
          id,
          stage_id,
          value
        `)
        .eq('assigned_to', user.id);

      if (error) throw error;

      // Get deal stages to identify closed deals
      const { data: dealStages, error: stagesError } = await supabase
        .from('deal_stages')
        .select('*')
        .order('position', { ascending: true });

      if (stagesError) throw stagesError;

      const userDeals = deals || [];
      const total = userDeals.length;
      
      // Assuming the last stage is "closed"
      const closedStageId = dealStages && dealStages.length > 0 ? 
        dealStages[dealStages.length - 1].id : null;
      
      const closed = closedStageId ? 
        userDeals.filter(deal => deal.stage_id === closedStageId).length : 0;
      const open = total - closed;
      
      const totalValue = userDeals.reduce((sum, deal) => 
        sum + (Number(deal.value) || 0), 0
      );

      return { total, open, closed, totalValue };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            My Deals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-32"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = dealStats || { total: 0, open: 0, closed: 0, totalValue: 0 };
  const closeRate = stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0;
  const trendDirection = closeRate >= 50 ? 'up' : 'down';

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            My Deals
          </div>
          <Badge variant={closeRate >= 50 ? "default" : "secondary"} className="text-xs">
            {closeRate}% close rate
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hero Metric */}
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            kr {stats.totalValue.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Pipeline Value</div>
        </div>

        {/* Close Rate Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Close Rate</span>
            <div className="flex items-center gap-1">
              {trendDirection === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-orange-600" />
              )}
              <span className="font-medium">{closeRate}%</span>
            </div>
          </div>
          <Progress 
            value={closeRate} 
            className={`h-2 ${closeRate >= 70 ? 'bg-green-100' : closeRate >= 40 ? 'bg-orange-100' : 'bg-red-100'}`} 
          />
        </div>

        {/* Supporting Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Total</span>
            </div>
            <div className="text-lg font-bold text-blue-700">{stats.total}</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CircleDollarSign className="h-3 w-3 text-orange-600" />
              <span className="text-xs text-orange-600 font-medium">Open</span>
            </div>
            <div className="text-lg font-bold text-orange-700">{stats.open}</div>
          </div>
        </div>

        {/* Status Insights */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>{stats.closed} deals closed</span>
          </div>
          {stats.open > 0 && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <CircleDollarSign className="h-3 w-3" />
              <span>{stats.open} deals in pipeline</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
