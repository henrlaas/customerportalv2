
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import Select from 'react-select';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  company_id: z.string().min(1, 'Please select a company'),
});

interface ExistingCompanyFormProps {
  onNext: (companyId: string) => void;
  onBack: () => void;
  defaultValue?: string;
}

export const ExistingCompanyForm: React.FC<ExistingCompanyFormProps> = ({
  onNext,
  onBack,
  defaultValue,
}) => {
  const [showSubsidiaries, setShowSubsidiaries] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_id: defaultValue || '',
    },
  });

  // Fetch companies with subsidiaries filter
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies', showSubsidiaries],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select('id, name, parent_id')
        .order('name');

      // Only show top-level companies when not showing subsidiaries
      if (!showSubsidiaries) {
        query = query.is('parent_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching companies:', error);
        return [];
      }

      return data || [];
    },
  });

  // Format companies for react-select
  const companyOptions = companies.map((company: any) => ({
    value: company.id,
    label: company.parent_id ? `↳ ${company.name}` : company.name
  }));

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onNext(values.company_id);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col gap-4">
          {/* Show subsidiaries toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel>Show Subsidiaries</FormLabel>
            </div>
            <Switch
              checked={showSubsidiaries}
              onCheckedChange={setShowSubsidiaries}
            />
          </div>

          {/* Company select with react-select */}
          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Company</FormLabel>
                <FormControl>
                  <Select
                    options={companyOptions}
                    value={companyOptions.find(option => option.value === field.value)}
                    onChange={(selectedOption) => field.onChange(selectedOption?.value || '')}
                    placeholder="Search and select a company..."
                    isClearable
                    isSearchable
                    isLoading={isLoading}
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
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  );
};
