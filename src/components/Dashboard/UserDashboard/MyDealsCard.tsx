
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const MyDealsCard = () => {
  const { user } = useAuth();

  const { data: dealsData, isLoading } = useQuery({
    queryKey: ['my-deals', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, open: 0, closed: 0, totalValue: 0 };

      // Get user's assigned deals
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

      // Get all deal stages to determine which is the last (closed) stage
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
        return sum + (deal.value ? Number(deal.value) : 0);
      }, 0) || 0;

      return { total, open, closed, totalValue };
    },
    enabled: !!user?.id,
  });

  const stats = dealsData || { total: 0, open: 0, closed: 0, totalValue: 0 };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          My Deals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : stats.total}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? '...' : stats.open}
            </div>
            <div className="text-xs text-gray-500">Open</div>
          </div>
        </div>
        <div className="text-center border-t pt-3">
          <div className="text-xl font-bold text-green-600">
            kr {isLoading ? '...' : stats.totalValue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Total Value</div>
        </div>
      </CardContent>
    </Card>
  );
};
