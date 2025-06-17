
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Target, Award } from 'lucide-react';

export const MyDealsCard = () => {
  const { user } = useAuth();

  const { data: dealStats, isLoading } = useQuery({
    queryKey: ['user-deal-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { open: 0, closed: 0, totalValue: 0, successRate: 0 };

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
      const closedWonStageId = '338e9b9c-bdd6-4ffb-8543-83cbeab7a7ae';
      
      const closed = userDeals.filter(deal => deal.stage_id === closedWonStageId).length;
      const open = userDeals.length - closed;
      
      const totalValue = userDeals.reduce((sum, deal) => 
        sum + (Number(deal.value) || 0), 0
      );

      const successRate = userDeals.length > 0 ? Math.round((closed / userDeals.length) * 100) : 0;

      return { open, closed, totalValue, successRate };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="h-full bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
            <TrendingUp className="h-5 w-5" />
            My Deals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground animate-pulse">
            <div className="h-12 bg-emerald-200 rounded-lg mb-4"></div>
            <div className="h-16 bg-emerald-200 rounded mb-2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = dealStats || { open: 0, closed: 0, totalValue: 0, successRate: 0 };

  return (
    <Card className="h-full bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100 hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
          <TrendingUp className="h-5 w-5" />
          My Deals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hero Section */}
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-600 mb-1">
            kr {stats.totalValue.toLocaleString()}
          </div>
          <div className="text-sm text-emerald-600/70 font-medium">Pipeline Value</div>
        </div>

        {/* Deal Counts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-white/60 rounded-lg p-3">
            <div className="text-xl font-semibold text-blue-600">{stats.open}</div>
            <div className="text-xs text-blue-600/70">Open</div>
          </div>
          <div className="text-center bg-white/60 rounded-lg p-3">
            <div className="text-xl font-semibold text-green-600">{stats.closed}</div>
            <div className="text-xs text-green-600/70">Closed Won</div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="flex items-center justify-center gap-2">
          <Award className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">
            {stats.successRate}% success rate
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
