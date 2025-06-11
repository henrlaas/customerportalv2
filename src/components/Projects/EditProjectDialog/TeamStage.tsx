
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { MultiAssigneeSelect } from '@/components/Tasks/MultiAssigneeSelect';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TeamStageProps {
  form: UseFormReturn<any>;
  projectId: string;
}

export const TeamStage: React.FC<TeamStageProps> = ({ form, projectId }) => {
  // Fetch all available users for assignment
  const { data: availableUsers = [] } = useQuery({
    queryKey: ['available-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, role')
        .in('role', ['admin', 'employee']);
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Team Assignment</h3>
      <p className="text-sm text-gray-600">
        Select team members who will work on this project.
      </p>
      
      <FormField
        control={form.control}
        name="assignees"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Team Members</FormLabel>
            <FormControl>
              <MultiAssigneeSelect
                users={availableUsers}
                selectedUserIds={field.value || []}
                onChange={field.onChange}
                placeholder="Select team members"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
