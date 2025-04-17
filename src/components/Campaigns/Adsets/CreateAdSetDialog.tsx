
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { AdSetFormData } from '../types/campaign';

interface Props {
  campaignId: string;
}

export function CreateAdSetDialog({ campaignId }: Props) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<AdSetFormData>({
    defaultValues: {
      name: '',
      target_audience: '', // Changed from 'targeting' to 'target_audience'
      campaign_id: campaignId,
    },
  });

  const onSubmit = async (data: AdSetFormData) => {
    const { error } = await supabase.from('adsets').insert(data);
    
    if (error) {
      toast({
        title: 'Error creating ad set',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Ad set created',
      description: 'Your ad set has been created successfully.',
    });
    
    // Invalidate queries to refresh data
    await queryClient.invalidateQueries({
      queryKey: ['adsets', campaignId]
    });
    
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          <span className="sr-only md:not-sr-only md:inline">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Ad Set</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Set Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="target_audience" // Changed from 'targeting' to 'target_audience'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Targeting</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Create Ad Set</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
