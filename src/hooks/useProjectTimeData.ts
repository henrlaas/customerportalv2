
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectTimeData } from '@/types/project';

export const useProjectTimeData = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['project-time', projectId],
    queryFn: async (): Promise<ProjectTimeData> => {
      if (!projectId) {
        return {
          totalHours: 0,
          billableHours: 0,
          nonBillableHours: 0,
        };
      }

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching time entries:', error);
        throw error;
      }

      let totalHours = 0;
      let billableHours = 0;
      let nonBillableHours = 0;

      // Calculate hours for each entry
      data.forEach(entry => {
        if (entry.start_time && entry.end_time) {
          const startTime = new Date(entry.start_time).getTime();
          const endTime = new Date(entry.end_time).getTime();
          const hoursWorked = (endTime - startTime) / (1000 * 60 * 60);

          totalHours += hoursWorked;
          if (entry.is_billable) {
            billableHours += hoursWorked;
          } else {
            nonBillableHours += hoursWorked;
          }
        }
      });

      // Calculate profitability if we have project value
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('value')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Error fetching project value:', projectError);
      }

      // Get assignees to calculate hourly rates
      const { data: assigneesData, error: assigneesError } = await supabase
        .from('project_assignees')
        .select('user_id')
        .eq('project_id', projectId);

      if (assigneesError) {
        console.error('Error fetching assignees:', assigneesError);
      }

      // Calculate average hourly rate if we have assignees with hourly_salary
      let averageHourlyRate = 0;
      if (assigneesData && assigneesData.length > 0) {
        const userIds = assigneesData.map(a => a.user_id);
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('hourly_salary')
          .in('id', userIds);

        if (!employeesError && employeesData && employeesData.length > 0) {
          const totalSalary = employeesData.reduce((sum, emp) => sum + (emp.hourly_salary || 0), 0);
          averageHourlyRate = totalSalary / employeesData.length;
        }
      }

      let profitability;
      if (projectData?.value && averageHourlyRate > 0) {
        profitability = projectData.value - (billableHours * averageHourlyRate);
      }

      return {
        totalHours,
        billableHours,
        nonBillableHours,
        profitability,
      };
    },
    enabled: !!projectId,
  });
};
