
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target, TrendingUp, Zap } from 'lucide-react';

export const TimeTrackingCard = () => {
  const { user } = useAuth();

  const { data: timeStats, isLoading } = useQuery({
    queryKey: ['user-time-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { hoursThisMonth: 0, estimatedSalary: 0, progressPercentage: 0, dailyAverage: 0 };

      console.log('TimeTrackingCard: Fetching time stats for user:', user.id);

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

      if (error) {
        console.error('Error fetching time entries:', error);
        throw error;
      }

      console.log('TimeTrackingCard: Found', timeEntries?.length || 0, 'time entries for current month');

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

      const result = { 
        hoursThisMonth: Number(hoursThisMonth.toFixed(1)), 
        estimatedSalary: Number(estimatedSalary.toFixed(0)),
        progressPercentage: Number(progressPercentage.toFixed(1)),
        dailyAverage: Number(dailyAverage.toFixed(1))
      };

      console.log('TimeTrackingCard: Calculated stats:', result);
      return result;
    },
    enabled: !!user?.id,
    staleTime: 30000, // Reduced from default to make updates more responsive
    refetchInterval: 60000, // Refetch every minute as backup
  });

  if (isLoading) {
    return (
      <Card className="h-full border-l-4 border-l-[#004743]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#004743]" />
            Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="bg-gray-200 h-16 rounded-lg"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-200 h-12 rounded-lg"></div>
              <div className="bg-gray-200 h-12 rounded-lg"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = timeStats || { hoursThisMonth: 0, estimatedSalary: 0, progressPercentage: 0, dailyAverage: 0 };
  const isOnTarget = stats.progressPercentage >= 75;
  const isExceeding = stats.progressPercentage >= 100;

  return (
    <Card className="h-full border-l-4 border-l-[#004743] bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-[#004743]">
            <Clock className="h-6 w-6 transition-transform group-hover:scale-110" />
            Time Tracking
          </CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isExceeding ? 'bg-[#F2FCE2] text-[#004743]' :
            isOnTarget ? 'bg-green-50 text-green-700' : 
            'bg-yellow-50 text-yellow-700'
          }`}>
            {isExceeding ? 'Goal Exceeded!' : isOnTarget ? 'On Target' : 'Building Up'}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Monthly Hours Hero */}
        <div className="relative">
          <div className="text-center bg-gradient-to-br from-[#004743]/5 to-[#F2FCE2]/30 rounded-xl p-4 border border-[#F2FCE2]/50">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-6 w-6 text-[#004743] mr-2" />
              <div className="text-4xl font-bold text-[#004743]">{stats.hoursThisMonth}h</div>
            </div>
            <div className="text-sm text-gray-600 font-medium mb-3">This Month</div>
            
            {/* Progress Bar with Goal Indicator */}
            <div className="w-full bg-gray-200 rounded-full h-3 relative">
              <div 
                className="bg-gradient-to-r from-[#004743] to-[#004743]/80 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.progressPercentage, 100)}%` }}
              ></div>
              {stats.progressPercentage > 100 && (
                <div className="absolute inset-0 bg-[#F2FCE2]/60 rounded-full"></div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.hoursThisMonth}h of 150h goal ({stats.progressPercentage.toFixed(0)}%)
            </div>
          </div>
        </div>

        {/* Earnings and Daily Average */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F2FCE2]/30 rounded-lg p-3 text-center border border-[#F2FCE2]/50 hover:bg-[#F2FCE2]/40 transition-colors">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-[#004743] mr-1" />
              <span className="text-lg font-bold text-[#004743]">
                kr {stats.estimatedSalary.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-gray-600">Earned</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200 hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 text-[#004743] mr-1" />
              <span className="text-lg font-bold text-[#004743]">{stats.dailyAverage}h</span>
            </div>
            <div className="text-xs text-gray-600">Daily Avg</div>
          </div>
        </div>

        {/* Productivity Insights */}
        <div className="bg-gradient-to-r from-[#F2FCE2]/20 to-[#F2FCE2]/10 rounded-lg p-3 border border-[#F2FCE2]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Monthly Progress</span>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              stats.progressPercentage >= 100 ? 'bg-[#004743] text-white' :
              stats.progressPercentage >= 75 ? 'bg-green-100 text-green-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {stats.progressPercentage >= 100 ? 'Exceeded!' : 
               stats.progressPercentage >= 75 ? 'On Track' : 
               'Needs Focus'}
            </div>
          </div>
          
          <div className="text-xs text-gray-600">
            {stats.progressPercentage >= 100 ? 
              `${(stats.hoursThisMonth - 150).toFixed(1)}h above target - excellent work!` :
              `${(150 - stats.hoursThisMonth).toFixed(1)}h remaining to reach monthly goal`
            }
          </div>
        </div>

        {/* Status Footer */}
        <div className="flex items-center justify-center pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-[#004743]">
            <Target className="h-4 w-4" />
            <span className="font-medium">
              {stats.progressPercentage >= 100 ? 'Outstanding performance!' : 
               stats.progressPercentage >= 75 ? 'Great momentum!' : 
               'Keep building momentum'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
