
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { dealDetailsFormSchema, DealDetailsFormValues } from '@/components/Deals/types/deal';

interface DealDetailsFormProps {
  onSubmit: (data: DealDetailsFormValues) => void;
  onBack: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<DealDetailsFormValues>;
}

export const DealDetailsForm: React.FC<DealDetailsFormProps> = ({
  onSubmit,
  onBack,
  isSubmitting = false,
  defaultValues = {},
}) => {
  const { user } = useAuth();
  
  const form = useForm<DealDetailsFormValues>({
    resolver: zodResolver(dealDetailsFormSchema),
    defaultValues: {
      title: '',
      description: '',
      deal_type: 'one-time',
      client_deal_type: 'web',
      value: 0,
      assigned_to: user?.id || '', // Set default assigned_to as the current user's ID
      ...defaultValues,
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .order('first_name');

      if (error) {
        console.error('Error fetching profiles:', error);
        return [];
      }

      return data;
    },
  });

  const eligibleProfiles = profiles.filter(
    (profile: any) => profile.role === 'admin' || profile.role === 'employee'
  );

  // Format profiles for react-select
  const assigneeOptions = [
    { value: 'unassigned', label: 'Unassigned' },
    ...eligibleProfiles.map((profile: any) => ({
      value: profile.id,
      label: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User'
    }))
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deal Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter deal title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter deal description"
                  className="min-h-24" 
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deal_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deal Type</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recurring" id="recurring" />
                    <FormLabel htmlFor="recurring" className="font-normal cursor-pointer">
                      Recurring
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="one-time" id="one-time" />
                    <FormLabel htmlFor="one-time" className="font-normal cursor-pointer">
                      One-time
                    </FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client_deal_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Deal Type</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="web" id="web" />
                    <FormLabel htmlFor="web" className="font-normal cursor-pointer">
                      Web Development
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="marketing" id="marketing" />
                    <FormLabel htmlFor="marketing" className="font-normal cursor-pointer">
                      Marketing
                    </FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value (MRR in NOK)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assigned_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned To (optional)</FormLabel>
              <FormControl>
                <Select
                  options={assigneeOptions}
                  value={assigneeOptions.find(option => option.value === field.value)}
                  onChange={(selectedOption) => field.onChange(selectedOption?.value || 'unassigned')}
                  placeholder="Select a team member..."
                  isClearable
                  isSearchable
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--input))',
                      backgroundColor: 'hsl(var(--background))',
                      borderRadius: 'calc(var(--radius) - 2px)',
                      boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring))' : 'none',
                      '&:hover': {
                        borderColor: 'hsl(var(--input))'
                      },
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
                        ? 'hsl(var(--accent) / 0.1)' 
                        : isSelected 
                          ? 'hsl(var(--accent))'
                          : undefined,
                      color: isSelected 
                        ? 'hsl(var(--accent-foreground))'
                        : 'hsl(var(--foreground))'
                    }),
                    input: (baseStyles) => ({
                      ...baseStyles,
                      color: 'hsl(var(--foreground))'
                    }),
                    singleValue: (baseStyles) => ({
                      ...baseStyles,
                      color: 'hsl(var(--foreground))'
                    }),
                    dropdownIndicator: (baseStyles) => ({
                      ...baseStyles,
                      color: 'hsl(var(--foreground) / 0.5)',
                      '&:hover': {
                        color: 'hsl(var(--foreground) / 0.8)'
                      }
                    }),
                    clearIndicator: (baseStyles) => ({
                      ...baseStyles,
                      color: 'hsl(var(--foreground) / 0.5)',
                      '&:hover': {
                        color: 'hsl(var(--foreground) / 0.8)'
                      }
                    })
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Deal'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
