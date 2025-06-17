
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDollarSign, TrendingUp, Target } from 'lucide-react';

export function MyDealsCard() {
  const { user } = useAuth();

  const { data: dealStats, isLoading } = useQuery({
    queryKey: ['my-deal-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, open: 0, closed: 0, totalValue: 0, closeRate: 0 };

      // Get deals assigned to the current user
      const { data: deals, error } = await supabase
        .from('deals')
        .select(`
          id,
          value,
          stage_id,
          deal_stages(position)
        `)
        .eq('assigned_to', user.id);

      if (error) throw error;

      // Get the highest position (last stage - typically closed)
      const { data: stages, error: stagesError } = await supabase
        .from('deal_stages')
        .select('id, position')
        .order('position', { ascending: false })
        .limit(1);

      if (stagesError) throw stagesError;

      const lastStagePosition = stages?.[0]?.position || 999;
      const total = deals?.length || 0;
      
      const closed = deals?.filter(deal => 
        deal.deal_stages?.position === lastStagePosition
      ).length || 0;
      
      const open = total - closed;
      
      const totalValue = deals?.reduce((sum, deal) => 
        sum + (Number(deal.value) || 0), 0
      ) || 0;
      
      const closeRate = total > 0 ? Math.round((closed / total) * 100) : 0;

      return { total, open, closed, totalValue, closeRate };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CircleDollarSign className="h-5 w-5 text-green-600" />
          My Deals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Total Deals</span>
          </div>
          <span className="font-semibold text-lg">{dealStats?.total || 0}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600">Open Deals</span>
          </div>
          <span className="font-semibold text-lg text-blue-600">{dealStats?.open || 0}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600">Total Value</span>
          </div>
          <span className="font-semibold text-lg text-green-600">
            kr {(dealStats?.totalValue || 0).toLocaleString()}
          </span>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Close Rate</span>
            <span className="font-semibold text-lg">{dealStats?.closeRate || 0}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
