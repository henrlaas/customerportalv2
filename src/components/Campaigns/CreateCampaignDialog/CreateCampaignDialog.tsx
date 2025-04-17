
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, X } from 'lucide-react';
import { CampaignFormData } from '../types/campaign';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Form } from '@/components/ui/form';
import { CampaignDetailsForm } from './CampaignDetailsForm';
import { CompanySelectionForm } from './CompanySelectionForm';
import { ProgressStepper } from './ProgressStepper';

const campaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company_id: z.string().min(1, 'Company is required'),
  platform: z.enum(['Meta', 'Tiktok', 'Google', 'Snapchat', 'LinkedIn'] as const),
  is_ongoing: z.boolean().default(false),
  start_date: z.date().nullable(),
  end_date: z.date().nullable(),
  budget: z.number().nullable(),
  description: z.string().nullable(),
  include_subsidiaries: z.boolean().default(false),
});

export function CreateCampaignDialog() {
  const [step, setStep] = React.useState(1);
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof campaignSchema>>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      company_id: '',
      platform: 'Meta',
      is_ongoing: false,
      start_date: null,
      end_date: null,
      budget: null,
      description: null,
      include_subsidiaries: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof campaignSchema>) => {
    try {
      // Format dates as ISO strings for Supabase
      const formattedValues = {
        ...values,
        start_date: values.start_date ? values.start_date.toISOString() : null,
        end_date: values.end_date ? values.end_date.toISOString() : null,
      };

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          name: formattedValues.name,
          company_id: formattedValues.company_id,
          platform: formattedValues.platform,
          start_date: formattedValues.start_date,
          end_date: formattedValues.end_date,
          budget: formattedValues.budget,
          description: formattedValues.description,
          status: 'in_progress',
          is_ongoing: formattedValues.is_ongoing,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Campaign created successfully',
      });

      setOpen(false);
      form.reset();
      setStep(1);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    form.reset();
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            New Campaign
          </DialogTitle>
        </DialogHeader>
        
        <ProgressStepper currentStep={step} totalSteps={2} />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {step === 1 ? (
              <CampaignDetailsForm 
                form={form}
                onNext={() => setStep(2)}
              />
            ) : (
              <CompanySelectionForm
                form={form}
                onBack={() => setStep(1)}
                isSubmitting={form.formState.isSubmitting}
              />
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
