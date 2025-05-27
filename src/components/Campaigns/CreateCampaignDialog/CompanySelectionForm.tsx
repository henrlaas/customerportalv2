
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import Select from 'react-select';

type CompanySelectionFormProps = {
  onBack: () => void;
  onNext: () => void;
  form: any;
};

export function CompanySelectionForm({ onBack, onNext, form }: CompanySelectionFormProps) {
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
  
  const includeSubsidiaries = form.watch('include_subsidiaries');

  // Transform companies data for react-select
  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name,
  }));

  // Find the selected option
  const selectedCompany = companyOptions.find(option => option.value === form.watch('company_id'));

  const handleNext = () => {
    form.trigger(['company_id']).then((isValid) => {
      if (isValid) {
        onNext();
      }
    });
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="include_subsidiaries"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel>Include Subsidiaries</FormLabel>
              <FormDescription>
                Include all subsidiaries of this company
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="company_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company *</FormLabel>
            <FormControl>
              <Select
                options={companyOptions}
                value={selectedCompany || null}
                onChange={(option) => field.onChange(option ? option.value : '')}
                placeholder="Select a company"
                isLoading={isLoading}
                isClearable
                isSearchable
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
          onClick={handleNext} 
          disabled={!form.getValues('company_id')}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
