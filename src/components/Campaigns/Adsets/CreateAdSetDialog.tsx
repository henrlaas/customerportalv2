import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const adsetSchema = z.object({
  name: z.string().min(1, { message: 'Ad Set name is required' }),
  targeting: z.string().optional(),
});

export function CreateAdSetDialog({ campaignId }: { campaignId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof adsetSchema>>({
    resolver: zodResolver(adsetSchema),
    defaultValues: {
      name: '',
      targeting: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof adsetSchema>) => {
    try {
      // Create the adset
      const { data: newAdSet, error: adsetError } = await supabase
        .from('adsets')
        .insert({
          name: values.name,
          campaign_id: campaignId,
          targeting: values.targeting,
        })
        .select()
        .single();

      if (adsetError) throw adsetError;

      // Check if campaign status needs to be updated to 'in-progress'
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('status')
        .eq('id', campaignId)
        .single();

      if (campaign?.status === 'draft') {
        await supabase
          .from('campaigns')
          .update({ status: 'in-progress' })
          .eq('id', campaignId);
      }

      toast({
        title: 'Success',
        description: 'Ad Set created successfully',
      });

      queryClient.invalidateQueries({ queryKey: ['adsets', campaignId] });
      form.reset();
      setOpen(false); // Close the dialog after successful creation
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
        <Button size="sm" className="transition-all hover:scale-105 hover:shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Create Ad Set
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Ad Set</DialogTitle>
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
                    <Input placeholder="Ad Set Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targeting"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Targeting</FormLabel>
                  <FormControl>
                    <Input placeholder="Targeting" {...field} />
                  </FormControl>
                  <FormMessage />
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
