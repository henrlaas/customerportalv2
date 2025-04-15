
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { newCompanyFormSchema, NewCompanyFormValues } from '../types/deal';

interface NewCompanyFormProps {
  onNext: (values: NewCompanyFormValues) => void;
  onBack: () => void;
}

export const NewCompanyForm: React.FC<NewCompanyFormProps> = ({
  onNext,
  onBack,
}) => {
  const form = useForm<NewCompanyFormValues>({
    resolver: zodResolver(newCompanyFormSchema),
    defaultValues: {
      company_name: '',
      organization_number: '',
      website: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organization_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter organization number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Form>
  );
};
