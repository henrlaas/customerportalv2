
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award, Target, DollarSign } from 'lucide-react';
import { useRealtimeDeals } from '@/hooks/realtime/useRealtimeDeals';

export const MyDealsCard = () => {
  const { user } = useAuth();

  // Enable real-time updates for deals
  useRealtimeDeals({ enabled: !!user?.id });

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
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 30 * 1000, // Refetch every 30 seconds as backup
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#004743]" />
            My Deals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="bg-gray-200 h-16 rounded-lg"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-200 h-12 rounded-lg"></div>
              <div className="bg-gray-200 h-12 rounded-lg"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = dealStats || { open: 0, closed: 0, totalValue: 0, successRate: 0 };
  const isPerformingWell = stats.successRate >= 70;

  return (
    <Card className="h-full bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-[#004743]">
            <TrendingUp className="h-6 w-6 transition-transform group-hover:scale-110" />
            My Deals
          </CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isPerformingWell 
              ? 'bg-[#F2FCE2] text-[#004743]' 
              : 'bg-yellow-50 text-yellow-700'
          }`}>
            {isPerformingWell ? 'Strong' : 'Growing'}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Pipeline Value Hero */}
        <div className="relative">
          <div className="text-center bg-gradient-to-br from-[#004743]/5 to-[#F2FCE2]/30 rounded-xl p-4 border border-[#F2FCE2]/50">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-6 w-6 text-[#004743] mr-1" />
              <div className="text-3xl font-bold text-[#004743]">
                kr {stats.totalValue.toLocaleString()}
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium">Total Pipeline Value</div>
          </div>
        </div>

        {/* Deal Counts */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200 hover:bg-blue-100 transition-colors">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-xl font-bold text-blue-600">{stats.open}</span>
            </div>
            <div className="text-xs text-blue-700 font-medium">Open Deals</div>
          </div>
          
          <div className="bg-[#F2FCE2]/40 rounded-lg p-3 text-center border border-[#F2FCE2] hover:bg-[#F2FCE2]/60 transition-colors">
            <div className="flex items-center justify-center mb-1">
              <Award className="h-4 w-4 text-[#004743] mr-1" />
              <span className="text-xl font-bold text-[#004743]">{stats.closed}</span>
            </div>
            <div className="text-xs text-[#004743] font-medium">Closed Won</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
