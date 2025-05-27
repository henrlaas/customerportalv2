
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { CompanyFavicon } from '@/components/CompanyFavicon';
import Select from 'react-select';

type CompanySelectionFormProps = {
  onBack: () => void;
  onNext: () => void;
  form: any;
};

export function CompanySelectionForm({ onBack, onNext, form }: CompanySelectionFormProps) {
  const includeSubsidiaries = form.watch('include_subsidiaries');
  
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies', includeSubsidiaries],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select('id, name, parent_id, website, logo_url')
        .order('name');
      
      // If subsidiaries toggle is OFF, only show parent companies (companies without parent_id)
      if (!includeSubsidiaries) {
        query = query.is('parent_id', null);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });

  // Custom option component for react-select with favicon
  const CustomOption = ({ data, ...props }: any) => (
    <div {...props.innerProps} className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer">
      <CompanyFavicon 
        companyName={data.companyName}
        website={data.website}
        logoUrl={data.logoUrl}
        size="sm"
      />
      <div className="flex flex-col">
        <span className={`${data.isSubsidiary ? 'ml-4' : ''}`}>
          {data.isSubsidiary && <span className="text-gray-400 mr-2">└─</span>}
          {data.label}
        </span>
        {data.isSubsidiary && (
          <span className="text-xs text-gray-500 ml-4">
            Subsidiary of {data.parentName}
          </span>
        )}
      </div>
    </div>
  );

  // Custom single value component for react-select with favicon
  const CustomSingleValue = ({ data }: any) => (
    <div className="flex items-center gap-2">
      <CompanyFavicon 
        companyName={data.companyName}
        website={data.website}
        logoUrl={data.logoUrl}
        size="sm"
      />
      <span>{data.label}</span>
    </div>
  );

  // Transform companies data for react-select with parent-child organization
  const companyOptions = React.useMemo(() => {
    if (!includeSubsidiaries) {
      return companies.map(company => ({
        value: company.id,
        label: company.name,
        companyName: company.name,
        website: company.website,
        logoUrl: company.logo_url,
        isSubsidiary: false,
      }));
    }

    // When subsidiaries are included, organize by parent-child relationship
    const parentCompanies = companies.filter(c => !c.parent_id);
    const subsidiaries = companies.filter(c => c.parent_id);
    
    const options: any[] = [];
    
    parentCompanies.forEach(parent => {
      // Add parent company
      options.push({
        value: parent.id,
        label: parent.name,
        companyName: parent.name,
        website: parent.website,
        logoUrl: parent.logo_url,
        isSubsidiary: false,
      });
      
      // Add its subsidiaries
      const childCompanies = subsidiaries.filter(sub => sub.parent_id === parent.id);
      childCompanies.forEach(child => {
        options.push({
          value: child.id,
          label: child.name,
          companyName: child.name,
          website: child.website,
          logoUrl: child.logo_url,
          isSubsidiary: true,
          parentName: parent.name,
        });
      });
    });
    
    // Add any subsidiaries without a parent company found in the current dataset
    const orphanSubsidiaries = subsidiaries.filter(sub => 
      !parentCompanies.find(parent => parent.id === sub.parent_id)
    );
    orphanSubsidiaries.forEach(orphan => {
      options.push({
        value: orphan.id,
        label: orphan.name,
        companyName: orphan.name,
        website: orphan.website,
        logoUrl: orphan.logo_url,
        isSubsidiary: true,
        parentName: 'Unknown Parent',
      });
    });
    
    return options;
  }, [companies, includeSubsidiaries]);

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
                components={{
                  Option: CustomOption,
                  SingleValue: CustomSingleValue,
                }}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    borderColor: 'hsl(var(--input))',
                    backgroundColor: 'hsl(var(--background))',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: 'hsl(var(--input))'
                    },
                    minHeight: '44px',
                    height: '44px',
                    padding: '0 8px',
                  }),
                  valueContainer: (baseStyles) => ({
                    ...baseStyles,
                    height: '44px',
                    padding: '0 8px',
                    display: 'flex',
                    alignItems: 'center',
                  }),
                  input: (baseStyles) => ({
                    ...baseStyles,
                    color: 'hsl(var(--foreground))',
                    margin: 0,
                    padding: 0,
                  }),
                  placeholder: (baseStyles) => ({
                    ...baseStyles,
                    color: 'hsl(var(--muted-foreground))',
                    margin: 0,
                  }),
                  singleValue: (baseStyles) => ({
                    ...baseStyles,
                    color: 'hsl(var(--foreground))',
                    margin: 0,
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
                  indicatorsContainer: (baseStyles) => ({
                    ...baseStyles,
                    height: '44px',
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
