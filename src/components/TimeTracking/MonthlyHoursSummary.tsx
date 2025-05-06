
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';

export const MonthlyHoursSummary = () => {
  const { user } = useAuth();
  const [totalHours, setTotalHours] = useState(0);
  const currentMonth = format(new Date(), 'yyyy-MM');

  const { data: monthlyHours } = useQuery({
    queryKey: ['monthlyHours', user?.id, currentMonth],
    queryFn: async () => {
      if (!user) return 0;

      const { data, error } = await supabase
        .rpc('get_monthly_hours', {
          user_id_param: user.id,
          year_month: currentMonth
        });
      
      if (error) {
        console.error('Error fetching monthly hours:', error);
        return 0;
      }
      
      return data || 0;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (monthlyHours !== undefined) {
      setTotalHours(Number(monthlyHours));
    }
  }, [monthlyHours]);

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Monthly Summary</h3>
            <p className="text-muted-foreground">{format(new Date(), 'MMMM yyyy')}</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold">{totalHours.toFixed(2)} hours</h2>
            <p className="text-muted-foreground">Total hours this month</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
