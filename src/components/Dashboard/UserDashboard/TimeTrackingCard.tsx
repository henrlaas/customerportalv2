
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, DollarSign } from 'lucide-react';

export function TimeTrackingCard() {
  const { user } = useAuth();

  const { data: timeStats, isLoading } = useQuery({
    queryKey: ['my-time-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { monthlyHours: 0, estimatedSalary: 0 };

      // Get current month's start and end
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Get time entries for this month
      const { data: timeEntries, error } = await supabase
        .from('time_entries')
        .select('start_time, end_time')
        .eq('user_id', user.id)
        .gte('start_time', monthStart.toISOString())
        .lte('start_time', monthEnd.toISOString())
        .not('end_time', 'is', null);

      if (error) throw error;

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
        .maybeSingle();

      if (employeeError) console.error('Error fetching employee data:', employeeError);

      const hourlySalary = employee?.hourly_salary || 0;
      const estimatedSalary = totalHours * hourlySalary;

      return { 
        monthlyHours: Number(totalHours.toFixed(1)), 
        estimatedSalary: Number(estimatedSalary.toFixed(0)) 
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
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
          <Clock className="h-5 w-5 text-purple-600" />
          Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Hours This Month</span>
          </div>
          <span className="font-semibold text-lg">{timeStats?.monthlyHours || 0}h</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600">Estimated Salary</span>
          </div>
          <span className="font-semibold text-lg text-green-600">
            kr {(timeStats?.estimatedSalary || 0).toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
