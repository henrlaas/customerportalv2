
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target } from 'lucide-react';

export const TimeTrackingCard = () => {
  const { user } = useAuth();

  const { data: timeStats, isLoading } = useQuery({
    queryKey: ['user-time-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { hoursThisMonth: 0, estimatedSalary: 0, progressPercentage: 0, dailyAverage: 0 };

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
      
      // Calculate progress towards 150-hour goal
      const monthlyGoal = 150;
      const progressPercentage = Math.min((hoursThisMonth / monthlyGoal) * 100, 100);
      
      // Calculate daily average
      const daysInMonth = now.getDate();
      const dailyAverage = daysInMonth > 0 ? hoursThisMonth / daysInMonth : 0;

      return { 
        hoursThisMonth: Number(hoursThisMonth.toFixed(1)), 
        estimatedSalary: Number(estimatedSalary.toFixed(0)),
        progressPercentage: Number(progressPercentage.toFixed(1)),
        dailyAverage: Number(dailyAverage.toFixed(1))
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-16 bg-gray-200 rounded mb-2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = timeStats || { hoursThisMonth: 0, estimatedSalary: 0, progressPercentage: 0, dailyAverage: 0 };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-600" />
          Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hero Section with Progress */}
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-600 mb-1">{stats.hoursThisMonth}h</div>
          <div className="text-sm text-muted-foreground font-medium mb-3">This Month</div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats.hoursThisMonth}h of the 150h goal
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-gray-50 rounded-lg p-3">
            <div className="text-xl font-semibold text-green-600">
              kr {stats.estimatedSalary.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Earned</div>
          </div>
          <div className="text-center bg-gray-50 rounded-lg p-3">
            <div className="text-xl font-semibold text-purple-600">{stats.dailyAverage}h</div>
            <div className="text-xs text-muted-foreground">Daily Avg</div>
          </div>
        </div>

        {/* Goal Status */}
        <div className="flex items-center justify-center gap-2">
          <Target className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-muted-foreground">
            {stats.progressPercentage >= 100 ? 'Goal achieved!' : 'On track'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
