
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dealDetailsStage1Schema, DealDetailsStage1Values } from '@/components/Deals/types/deal';

interface DealDetailsStage1FormProps {
  onNext: (data: DealDetailsStage1Values) => void;
  onBack: () => void;
  defaultValues?: Partial<DealDetailsStage1Values>;
}

export const DealDetailsStage1Form: React.FC<DealDetailsStage1FormProps> = ({
  onNext,
  onBack,
  defaultValues = {}
}) => {
  const form = useForm<DealDetailsStage1Values>({
    resolver: zodResolver(dealDetailsStage1Schema),
    defaultValues: {
      title: '',
      description: '',
      ...defaultValues
    }
  });

  const handleSubmit = (data: DealDetailsStage1Values) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deal Title *</FormLabel>
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
              <FormLabel>Deal Description *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter deal description" 
                  className="min-h-24" 
                  {...field} 
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
          <Button type="submit">
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
};
