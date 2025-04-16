
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
import { PlusCircle } from 'lucide-react';
import { CampaignFormData, Platform } from '../types/campaign';
import { CampaignBasicInfoForm } from './CampaignBasicInfoForm';
import { CampaignBudgetForm } from './CampaignBudgetForm';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const campaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company_id: z.string().min(1, 'Company is required'),
  platform: z.enum(['Meta', 'Tiktok', 'Google', 'Snapchat', 'LinkedIn'] as const),
  start_date: z.date().nullable(),
  end_date: z.date().nullable(),
  budget: z.number().nullable(),
  description: z.string().nullable(),
});

export function CreateCampaignDialog() {
  const [step, setStep] = React.useState(1);
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      platform: 'Meta',
      start_date: null,
      end_date: null,
      budget: null,
      description: null,
    },
  });

  const onSubmit = async (values: CampaignFormData) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          ...values,
          status: 'in_progress',
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
          <DialogTitle>
            {step === 1 ? 'Campaign Details' : 'Campaign Budget'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {step === 1 ? (
            <CampaignBasicInfoForm 
              form={form}
              onNext={() => setStep(2)}
            />
          ) : (
            <CampaignBudgetForm
              form={form}
              onBack={() => setStep(1)}
              isSubmitting={form.formState.isSubmitting}
            />
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
