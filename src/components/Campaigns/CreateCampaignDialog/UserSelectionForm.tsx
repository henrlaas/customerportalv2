
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Select from 'react-select';

type UserSelectionFormProps = {
  onNext: (values: any) => void;
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

  // Set default associated_user_id if not already set
  React.useEffect(() => {
    if (!form.getValues('associated_user_id') && user?.id) {
      form.setValue('associated_user_id', user.id);
    }
  }, [form, user]);

  // Transform employees data for react-select
  const userOptions = employees.map(employee => ({
    value: employee.id,
    label: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unknown User',
  }));

  // Find the selected option
  const selectedUser = userOptions.find(option => option.value === form.watch('associated_user_id'));

  // Function to handle form submission
  const handleSubmit = () => {
    form.trigger(['associated_user_id']).then((isValid) => {
      if (isValid) {
        setLoading(true);
        const values = form.getValues();
        onNext(values);
        setLoading(false);
      }
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="associated_user_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Associated User *</FormLabel>
              <FormControl>
                <Select
                  options={userOptions}
                  value={selectedUser || null}
                  onChange={(option) => field.onChange(option ? option.value : '')}
                  placeholder="Select a user"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      borderColor: 'hsl(var(--input))',
                      backgroundColor: 'hsl(var(--background))',
                      borderRadius: 'var(--radius)',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: 'hsl(var(--input))'
                      },
                      padding: '1px',
                      minHeight: '40px'
                    }),
                    placeholder: (baseStyles) => ({
                      ...baseStyles,
                      color: 'hsl(var(--muted-foreground))'
                    }),
                    menu: (baseStyles) => ({
                      ...baseStyles,
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      zIndex: 50
                    }),
                    option: (baseStyles, { isFocused, isSelected }) => ({
                      ...baseStyles,
                      backgroundColor: isFocused 
                        ? '#f3f3f3'
                        : isSelected 
                          ? 'hsl(var(--accent) / 0.2)'
                          : undefined,
                      color: 'hsl(var(--foreground))'
                    }),
                    singleValue: (baseStyles) => ({
                      ...baseStyles,
                      color: 'hsl(var(--foreground))'
                    }),
                    input: (baseStyles) => ({
                      ...baseStyles,
                      color: 'hsl(var(--foreground))'
                    }),
                  }}
                />
              </FormControl>
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
          
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={loading || !form.getValues('associated_user_id')}
          >
            {loading ? 'Saving...' : 'Save Campaign'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
