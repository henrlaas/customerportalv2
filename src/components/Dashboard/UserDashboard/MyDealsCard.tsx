
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, CircleDollarSign } from 'lucide-react';

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
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            My Deals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const stats = dealStats || { total: 0, open: 0, closed: 0, totalValue: 0 };
  const closeRate = stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          My Deals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">{stats.open}</div>
            <div className="text-xs text-muted-foreground">Open</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">{stats.closed}</div>
            <div className="text-xs text-muted-foreground">Closed</div>
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <CircleDollarSign className="h-4 w-4 text-primary" />
            <span>kr {stats.totalValue.toLocaleString()} total value</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>{closeRate}% close rate</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
