
import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { CompanyContact } from '@/types/company';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Form schema - removed is_admin field
const contactFormSchema = z.object({
  position: z.string().optional(),
  is_primary: z.boolean().default(false),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

type EditContactDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  contact: CompanyContact | null;
};

export const EditContactDialog = ({
  isOpen,
  onClose,
  contact,
}: EditContactDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      position: '',
      is_primary: false,
    },
  });
  
  // Update form when contact prop changes
  useEffect(() => {
    if (contact) {
      form.reset({
        position: contact.position || '',
        is_primary: contact.is_primary || false,
      });
    }
  }, [contact, form]);
  
  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: (values: ContactFormValues) => companyService.updateContact(contact?.id as string, values),
    onSuccess: () => {
      toast({
        title: 'Contact updated',
        description: 'The contact has been updated successfully',
      });
      
      // Invalidate the company contacts query
      queryClient.invalidateQueries({ queryKey: ['companyContacts', contact?.company_id] });
      
      // Close dialog
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update contact: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const onSubmit = (values: ContactFormValues) => {
    updateContactMutation.mutate(values);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_primary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Primary Contact</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={updateContactMutation.isPending}
              >
                {updateContactMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
