
import { useState, useEffect } from 'react';
import { format, subMonths, addMonths, startOfMonth } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const MonthlyHoursSummary = () => {
  const { user } = useAuth();
  const [totalHours, setTotalHours] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const formattedMonth = format(selectedMonth, 'yyyy-MM');

  const { data: monthlyHours } = useQuery({
    queryKey: ['monthlyHours', user?.id, formattedMonth],
    queryFn: async () => {
      if (!user) return 0;

      // Use the database function to get monthly hours
      const { data, error } = await supabase.rpc('get_monthly_hours', {
        user_id_param: user.id,
        year_month: formattedMonth
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

  const goToPreviousMonth = () => {
    setSelectedMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const goToNextMonth = () => {
    const nextMonth = addMonths(selectedMonth, 1);
    const currentMonth = startOfMonth(new Date());
    
    // Don't allow going beyond current month
    if (nextMonth <= currentMonth) {
      setSelectedMonth(nextMonth);
    }
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(new Date());
  };

  const isCurrentMonth = format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Monthly Summary</h3>
            <div className="flex items-center gap-2 mt-1">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToPreviousMonth}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-muted-foreground px-2 min-w-[130px]">
                {format(selectedMonth, 'MMMM yyyy')}
              </p>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToNextMonth}
                disabled={isCurrentMonth}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {!isCurrentMonth && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToCurrentMonth}
                  className="ml-2 text-xs h-8"
                >
                  Current Month
                </Button>
              )}
            </div>
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
