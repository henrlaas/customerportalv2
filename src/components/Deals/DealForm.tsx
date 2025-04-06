
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Company, Profile, Stage, Deal } from './DealCard';

// Deal form schema
const dealSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  company_id: z.string().optional(),
  stage_id: z.string().optional(),
  expected_close_date: z.string().optional(),
  value: z.string().optional().transform(val => val ? parseFloat(val) : null),
  probability: z.number().min(0).max(100).optional(),
  assigned_to: z.string().optional(),
});

export type DealFormValues = z.infer<typeof dealSchema>;

interface DealFormProps {
  onSubmit: (values: DealFormValues) => void;
  companies: Company[];
  stages: Stage[];
  profiles: Profile[];
  defaultValues?: Partial<DealFormValues>;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel?: () => void;
}

export const DealForm: React.FC<DealFormProps> = ({
  onSubmit,
  companies,
  stages,
  profiles,
  defaultValues,
  isSubmitting,
  submitLabel,
  onCancel
}) => {
  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      company_id: '',
      stage_id: '',
      expected_close_date: '',
      value: '',
      probability: 50,
      assigned_to: '',
    },
  });

  const handleSubmit = (values: DealFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deal Title</FormLabel>
              <FormControl>
                <Input placeholder="Marketing Campaign Deal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No company</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stage_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deal Stage</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stages.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deal Value</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expected_close_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Close Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="probability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Deal Probability: {field.value}%
              </FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  defaultValue={[field.value || 50]}
                  onValueChange={(vals) => field.onChange(vals[0])}
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
              <FormLabel>Assigned To</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {profiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any details about the deal"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          {onCancel && (
            <DialogClose asChild>
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
            </DialogClose>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : submitLabel}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default DealForm;
