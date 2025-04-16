
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

interface Props {
  form: UseFormReturn<any>;
  onBack: () => void;
  isSubmitting: boolean;
}

export function CompanySelectionForm({ form, onBack, isSubmitting }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, parent_id')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const includeSubsidiaries = form.watch('include_subsidiaries');
  
  // Filter companies based on search term
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (includeSubsidiaries) {
      return matchesSearch;
    } else {
      // Only show parent companies (those without parent_id)
      return matchesSearch && !company.parent_id;
    }
  });

  return (
    <div className="space-y-4 py-2">
      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search companies..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <FormField
        control={form.control}
        name="include_subsidiaries"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Include Subsidiaries</FormLabel>
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
          <FormItem className="space-y-3">
            <FormLabel>Select Company</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="space-y-2 max-h-64 overflow-y-auto"
              >
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <FormItem key={company.id} className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={company.id} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {company.name} {company.parent_id && <span className="text-xs text-muted-foreground">(Subsidiary)</span>}
                      </FormLabel>
                    </FormItem>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No companies found</div>
                )}
              </RadioGroup>
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
          {isSubmitting ? 'Creating...' : 'Create Campaign'}
        </Button>
      </div>
    </div>
  );
}
