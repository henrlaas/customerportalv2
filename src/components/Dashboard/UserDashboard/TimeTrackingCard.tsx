
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Calendar, Target } from 'lucide-react';

export const TimeTrackingCard = () => {
  const { user } = useAuth();

  const { data: timeStats, isLoading } = useQuery({
    queryKey: ['user-time-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { hoursThisMonth: 0, estimatedSalary: 0, daysWorked: 0, averageDaily: 0 };

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

      // Calculate total hours and days worked
      let hoursThisMonth = 0;
      const daysWorkedSet = new Set();
      
      if (timeEntries) {
        timeEntries.forEach(entry => {
          if (entry.start_time && entry.end_time) {
            const start = new Date(entry.start_time);
            const end = new Date(entry.end_time);
            const diffMs = end.getTime() - start.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            hoursThisMonth += diffHours;
            
            // Track unique days worked
            const dayKey = start.toDateString();
            daysWorkedSet.add(dayKey);
          }
        });
      }

      const daysWorked = daysWorkedSet.size;
      const averageDaily = daysWorked > 0 ? hoursThisMonth / daysWorked : 0;

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
        estimatedSalary: Number(estimatedSalary.toFixed(0)),
        daysWorked,
        averageDaily: Number(averageDaily.toFixed(1))
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-20"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = timeStats || { hoursThisMonth: 0, estimatedSalary: 0, daysWorked: 0, averageDaily: 0 };
  
  // Assuming a target of 160 hours per month (8 hours * 20 working days)
  const monthlyTarget = 160;
  const progressPercentage = Math.min((stats.hoursThisMonth / monthlyTarget) * 100, 100);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Time Tracking
          </div>
          <Badge variant={stats.hoursThisMonth >= monthlyTarget * 0.8 ? "default" : "secondary"} className="text-xs">
            {stats.daysWorked} days
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hero Metric */}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-1">
            {stats.hoursThisMonth}h
          </div>
          <div className="text-sm text-muted-foreground">This Month</div>
        </div>

        {/* Monthly Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly Goal</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-xs text-muted-foreground text-center">
            {stats.hoursThisMonth} / {monthlyTarget} hours
          </div>
        </div>

        {/* Supporting Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Earned</span>
            </div>
            <div className="text-sm font-bold text-green-700">
              kr {stats.estimatedSalary.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Daily Avg</span>
            </div>
            <div className="text-sm font-bold text-blue-700">{stats.averageDaily}h</div>
          </div>
        </div>

        {/* Status Insights */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Calendar className="h-3 w-3" />
            <span>{stats.daysWorked} days worked this month</span>
          </div>
          {stats.averageDaily > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Clock className="h-3 w-3" />
              <span>{stats.averageDaily}h average per day</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
