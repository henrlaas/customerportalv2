
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const userSelectionSchema = z.object({
  associated_user_id: z.string().min(1, 'Please select a user')
});

type UserSelectionFormProps = {
  onNext: () => void;
  onBack: () => void;
  form: any;
};

export function UserSelectionForm({ onNext, onBack, form }: UserSelectionFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      try {
        // Fetch users who are employees or admins from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('role', ['employee', 'admin']);
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching employees:', error);
        return [];
      }
    }
  });

  const handleSubmit = () => {
    setLoading(true);
    // Continue to the next step
    onNext();
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="associated_user_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Associated User</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value || user?.id}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
          >
            Back
          </Button>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Campaign'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
