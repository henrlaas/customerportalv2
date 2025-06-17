
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, DollarSign } from 'lucide-react';

export const TimeTrackingCard = () => {
  const { user } = useAuth();

  const { data: timeTrackingStats, isLoading } = useQuery({
    queryKey: ['user-time-tracking-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { hoursThisMonth: 0, estimatedSalary: 0 };

      // Get current month start and end
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Get time entries for current month
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('start_time, end_time')
        .eq('user_id', user.id)
        .gte('start_time', monthStart.toISOString())
        .lte('start_time', monthEnd.toISOString())
        .not('end_time', 'is', null);

      if (timeError) throw timeError;

      // Calculate total hours
      let totalHours = 0;
      if (timeEntries) {
        timeEntries.forEach(entry => {
          if (entry.start_time && entry.end_time) {
            const start = new Date(entry.start_time);
            const end = new Date(entry.end_time);
            const diffMs = end.getTime() - start.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            totalHours += diffHours;
          }
        });
      }

      // Get user's hourly salary from employees table
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('hourly_salary')
        .eq('id', user.id)
        .single();

      let estimatedSalary = 0;
      if (!employeeError && employee?.hourly_salary) {
        estimatedSalary = totalHours * Number(employee.hourly_salary);
      }

      return {
        hoursThisMonth: Number(totalHours.toFixed(1)),
        estimatedSalary: Math.round(estimatedSalary)
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
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
          <Clock className="h-5 w-5" />
          Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Hours This Month</span>
            <span className="text-2xl font-bold">{timeTrackingStats?.hoursThisMonth || 0}h</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm">Estimated Salary</span>
            </div>
            <span className="text-lg font-semibold text-green-600">
              kr {timeTrackingStats?.estimatedSalary.toLocaleString() || 0}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
