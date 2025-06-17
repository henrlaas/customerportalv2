
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CircleDollarSign, TrendingUp, TrendingDown } from 'lucide-react';

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
          value,
          stage_id,
          deal_stages (
            id,
            name,
            position
          )
        `)
        .eq('assigned_to', user.id);

      if (error) throw error;

      // Get all deal stages to identify the last one (closed)
      const { data: allStages, error: stagesError } = await supabase
        .from('deal_stages')
        .select('*')
        .order('position', { ascending: true });

      if (stagesError) throw stagesError;

      const lastStageId = allStages?.[allStages.length - 1]?.id;
      
      const total = deals?.length || 0;
      const closed = deals?.filter(d => d.stage_id === lastStageId).length || 0;
      const open = total - closed;
      
      const totalValue = deals?.reduce((sum, deal) => {
        return sum + (Number(deal.value) || 0);
      }, 0) || 0;

      return { total, open, closed, totalValue };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5" />
            My Deals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CircleDollarSign className="h-5 w-5" />
          My Deals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Value</span>
            <span className="text-2xl font-bold">kr {dealStats?.totalValue.toLocaleString() || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Deals</span>
            <span className="text-lg font-semibold">{dealStats?.total || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm">Open Deals</span>
            </div>
            <span className="text-lg font-semibold text-green-600">{dealStats?.open || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Closed Deals</span>
            </div>
            <span className="text-lg font-semibold text-gray-600">{dealStats?.closed || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
