
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { KeyResult } from '@/pages/OKRPage';

const editKeyResultSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  target_value: z.coerce.number().min(0, 'Target value must be positive'),
  current_value: z.coerce.number().min(0, 'Current value must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  status: z.enum(['not_started', 'on_track', 'at_risk', 'completed']),
});

type EditKeyResultFormData = z.infer<typeof editKeyResultSchema>;

interface EditKeyResultDialogProps {
  keyResult: KeyResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditKeyResultDialog: React.FC<EditKeyResultDialogProps> = ({
  keyResult,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditKeyResultFormData>({
    resolver: zodResolver(editKeyResultSchema),
    defaultValues: {
      title: keyResult?.title || '',
      description: keyResult?.description || '',
      target_value: keyResult?.target_value || 0,
      current_value: keyResult?.current_value || 0,
      unit: keyResult?.unit || '%',
      status: keyResult?.status || 'not_started',
    },
  });

  React.useEffect(() => {
    if (keyResult) {
      form.reset({
        title: keyResult.title,
        description: keyResult.description || '',
        target_value: keyResult.target_value,
        current_value: keyResult.current_value,
        unit: keyResult.unit,
        status: keyResult.status,
      });
    }
  }, [keyResult, form]);

  const updateKeyResultMutation = useMutation({
    mutationFn: async (data: EditKeyResultFormData) => {
      if (!keyResult) throw new Error('No key result selected');

      const { error } = await supabase
        .from('key_results')
        .update({
          title: data.title,
          description: data.description || null,
          target_value: data.target_value,
          current_value: data.current_value,
          unit: data.unit,
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', keyResult.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
      if (keyResult) {
        queryClient.invalidateQueries({ queryKey: ['okr', keyResult.okr_id] });
      }
      toast({
        title: 'Key result updated successfully',
        description: 'The key result has been updated.',
      });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error('Error updating key result:', error);
      toast({
        title: 'Error updating key result',
        description: 'An error occurred while updating the key result. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: EditKeyResultFormData) => {
    updateKeyResultMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Key Result</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter key result title" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter key result description (optional)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Value</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Value</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., %, $, units" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="on_track">On Track</SelectItem>
                        <SelectItem value="at_risk">At Risk</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateKeyResultMutation.isPending}>
                {updateKeyResultMutation.isPending ? 'Updating...' : 'Update Key Result'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
