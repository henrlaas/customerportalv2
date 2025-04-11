
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';

// Define types for Company, Stage, and Profile
type Company = {
  id: string;
  name: string;
};

type Stage = {
  id: string;
  name: string;
  position: number;
};

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
};

// Schema for form validation
export const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  company_id: z.string().min(1, { message: 'Company is required' }),
  // Transform string to number for value field
  value: z.coerce.number().default(0),
  assigned_to: z.string(),
  is_recurring: z.boolean().default(false),
});

// Define the form values type from the schema
export type DealFormValues = z.infer<typeof formSchema>;

// Default form values - using number for value to match the schema
export const defaultValues: Partial<DealFormValues> = {
  title: '',
  description: '',
  company_id: '',
  value: 0,
  assigned_to: '',
  is_recurring: false,
};

interface DealFormProps {
  onSubmit: (values: DealFormValues) => void;
  companies: Company[];
  stages: Stage[];
  profiles: Profile[];
  defaultValues?: Partial<DealFormValues>;
  isSubmitting?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

export const DealForm: React.FC<DealFormProps> = ({
  onSubmit,
  companies,
  stages,
  profiles,
  defaultValues: propDefaultValues,
  isSubmitting = false,
  submitLabel = 'Submit',
  onCancel,
}) => {
  // Initialize the form with default values or values passed from props
  const form = useForm<DealFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...defaultValues, ...propDefaultValues },
  });

  // Filter profiles to only show admin and employee roles
  const eligibleProfiles = profiles.filter(
    profile => profile.role === 'admin' || profile.role === 'employee'
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deal Name</FormLabel>
              <FormControl>
                <Input placeholder="Deal title" {...field} />
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
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Brief deal description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No Company</SelectItem>
                  {companies.map((company) => (
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
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value (MRR in NOK)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Deal value in NOK"
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
          name="is_recurring"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Deal Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === 'true')}
                  defaultValue={field.value ? 'true' : 'false'}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="recurring" />
                    <FormLabel htmlFor="recurring" className="font-normal cursor-pointer">
                      Recurring
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="one-time" />
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
          name="assigned_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned To</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {eligibleProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.first_name} {profile.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};
