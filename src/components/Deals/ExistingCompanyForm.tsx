
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubsidiaries, setShowSubsidiaries] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_id: defaultValue || '',
    },
  });

  // Fetch companies with search and subsidiaries filter
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies', searchQuery, showSubsidiaries],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select('id, name, parent_id')
        .ilike('name', `%${searchQuery}%`)
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onNext(values.company_id);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col gap-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

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

          {/* Company select */}
          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Company</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies.map((company: any) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.parent_id && '↳ '}{company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
