
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, DollarSign } from 'lucide-react';

export const TimeTrackingCard = () => {
  const { user } = useAuth();

  const { data: timeStats, isLoading } = useQuery({
    queryKey: ['user-time-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { hoursThisMonth: 0, estimatedSalary: 0 };

      // Get current month start and end
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Get time entries for current month
      const { data: timeEntries, error } = await supabase
        .from('time_entries')
        .select('start_time, end_time')
        .eq('user_id', user.id)
        .gte('start_time', monthStart.toISOString())
        .lte('start_time', monthEnd.toISOString())
        .not('end_time', 'is', null);

      if (error) throw error;

      // Calculate total hours
      let hoursThisMonth = 0;
      if (timeEntries) {
        timeEntries.forEach(entry => {
          if (entry.start_time && entry.end_time) {
            const start = new Date(entry.start_time);
            const end = new Date(entry.end_time);
            const diffMs = end.getTime() - start.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            hoursThisMonth += diffHours;
          }
        });
      }

      // Get user's hourly salary from employees table
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('hourly_salary')
        .eq('id', user.id)
        .maybeSingle();

      const hourlySalary = employee?.hourly_salary || 0;
      const estimatedSalary = hoursThisMonth * hourlySalary;

      return { 
        hoursThisMonth: Number(hoursThisMonth.toFixed(1)), 
        estimatedSalary: Number(estimatedSalary.toFixed(0)) 
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const stats = timeStats || { hoursThisMonth: 0, estimatedSalary: 0 };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{stats.hoursThisMonth}h</div>
            <div className="text-xs text-muted-foreground">This Month</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">kr {stats.estimatedSalary.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Estimated</div>
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span>{stats.hoursThisMonth} hours logged this month</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span>Based on hourly rate</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
