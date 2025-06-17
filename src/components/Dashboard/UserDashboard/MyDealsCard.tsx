
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, CircleDollarSign, CheckCircle, Target } from 'lucide-react';

export const MyDealsCard = () => {
  const { user } = useAuth();

  const { data: dealStats, isLoading } = useQuery({
    queryKey: ['user-deal-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { open: 0, closed: 0, totalValue: 0 };

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

      const userDeals = deals || [];
      
      // The specific "Closed Won" stage ID
      const closedWonStageId = '338e9b9c-bdd6-4ffb-8543-83cbeab7a7ae';
      
      const closed = userDeals.filter(deal => deal.stage_id === closedWonStageId).length;
      const open = userDeals.filter(deal => deal.stage_id !== closedWonStageId).length;
      
      const totalValue = userDeals.reduce((sum, deal) => 
        sum + (Number(deal.value) || 0), 0
      );

      return { open, closed, totalValue };
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

  const stats = dealStats || { open: 0, closed: 0, totalValue: 0 };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            My Deals
          </div>
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

        {/* Supporting Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CircleDollarSign className="h-3 w-3 text-orange-600" />
              <span className="text-xs text-orange-600 font-medium">Open</span>
            </div>
            <div className="text-lg font-bold text-orange-700">{stats.open}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Closed</span>
            </div>
            <div className="text-lg font-bold text-green-700">{stats.closed}</div>
          </div>
        </div>

        {/* Status Insights */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-3 w-3" />
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
