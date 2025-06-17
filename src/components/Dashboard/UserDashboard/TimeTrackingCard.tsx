
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const TimeTrackingCard = () => {
  const { user } = useAuth();

  const { data: timeData, isLoading } = useQuery({
    queryKey: ['my-time-tracking', user?.id],
    queryFn: async () => {
      if (!user?.id) return { monthlyHours: 0, estimatedSalary: 0 };

      // Get current month in YYYY-MM format
      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Get monthly hours using the existing RPC function
      const { data: monthlyHours, error: hoursError } = await supabase
        .rpc('get_monthly_hours', {
          user_id_param: user.id,
          year_month: yearMonth
        });

      if (hoursError) throw hoursError;

      // Get user's hourly salary from employees table
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('hourly_salary')
        .eq('id', user.id)
        .single();

      if (employeeError && employeeError.code !== 'PGRST116') {
        console.error('Error fetching employee data:', employeeError);
      }

      const hourlyRate = employee?.hourly_salary || 0;
      const hours = monthlyHours || 0;
      const estimatedSalary = hourlyRate * hours;

      return { 
        monthlyHours: Number(hours), 
        estimatedSalary: Number(estimatedSalary),
        hourlyRate: Number(hourlyRate)
      };
    },
    enabled: !!user?.id,
  });

  const stats = timeData || { monthlyHours: 0, estimatedSalary: 0, hourlyRate: 0 };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-600" />
          Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {isLoading ? '...' : stats.monthlyHours.toFixed(1)}h
          </div>
          <div className="text-sm text-gray-500">Hours This Month</div>
        </div>
        <div className="text-center border-t pt-3">
          <div className="text-xl font-bold text-green-600">
            kr {isLoading ? '...' : Math.round(stats.estimatedSalary).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            Estimated Salary (kr {stats.hourlyRate}/hr)
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
