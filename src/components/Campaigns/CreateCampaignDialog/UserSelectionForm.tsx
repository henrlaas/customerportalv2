import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
          .select('id, first_name, last_name, avatar_url')
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

  // Helper function to get user initials
  const getUserInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Custom option component for react-select with avatar
  const CustomOption = ({ data, ...props }: any) => (
    <div {...props.innerProps} className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer">
      <Avatar className="h-6 w-6">
        <AvatarImage src={data.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {getUserInitials(data.firstName, data.lastName)}
        </AvatarFallback>
      </Avatar>
      <span>{data.label}</span>
    </div>
  );

  // Custom single value component for react-select with avatar
  const CustomSingleValue = ({ data }: any) => (
    <div className="flex items-center gap-2">
      <Avatar className="h-5 w-5">
        <AvatarImage src={data.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {getUserInitials(data.firstName, data.lastName)}
        </AvatarFallback>
      </Avatar>
      <span>{data.label}</span>
    </div>
  );

  // Transform employees data for react-select
  const userOptions = employees.map(employee => ({
    value: employee.id,
    label: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unknown User',
    avatar_url: employee.avatar_url,
    firstName: employee.first_name,
    lastName: employee.last_name,
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
                  components={{
                    Option: CustomOption,
                    SingleValue: CustomSingleValue,
                  }}
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
                      padding: '4px 8px',
                      minHeight: '44px'
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
                    option: (baseStyles) => ({
                      ...baseStyles,
                      backgroundColor: 'transparent',
                      color: 'hsl(var(--foreground))',
                      padding: 0,
                    }),
                    singleValue: (baseStyles) => ({
                      ...baseStyles,
                      color: 'hsl(var(--foreground))',
                      margin: 0,
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
