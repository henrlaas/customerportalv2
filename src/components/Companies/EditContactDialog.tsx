
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { CompanyContact } from '@/types/company';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
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
import { useEffect } from 'react';

// Form schema
const editContactFormSchema = z.object({
  position: z.string().optional(),
  is_primary: z.boolean().default(false),
  is_admin: z.boolean().default(false),
});

type EditContactFormValues = z.infer<typeof editContactFormSchema>;

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
  
  const form = useForm<EditContactFormValues>({
    resolver: zodResolver(editContactFormSchema),
    defaultValues: {
      position: contact?.position || '',
      is_primary: contact?.is_primary || false,
      is_admin: contact?.is_admin || false,
    },
  });
  
  // Update form when contact changes
  useEffect(() => {
    if (contact) {
      form.reset({
        position: contact.position || '',
        is_primary: contact.is_primary || false,
        is_admin: contact.is_admin || false,
      });
    }
  }, [contact, form]);
  
  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: async (values: EditContactFormValues) => {
      if (!contact) throw new Error('No contact selected');
      return companyService.updateCompanyContact(contact.id, {
        position: values.position || null,
        is_primary: values.is_primary,
        is_admin: values.is_admin,
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Contact updated',
        description: 'The contact information has been updated',
      });
      queryClient.invalidateQueries({ queryKey: ['companyContacts', contact?.company_id] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update contact: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (values: EditContactFormValues) => {
    updateContactMutation.mutate(values);
  };
  
  if (!contact) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-primary/10 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
          </div>
          <div>
            <h3 className="font-medium">
              {contact.first_name} {contact.last_name}
            </h3>
            <p className="text-sm text-muted-foreground">{contact.email}</p>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. CEO, Marketing Director" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="is_primary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Primary Contact</FormLabel>
                      <FormDescription>
                        Mark as primary contact
                      </FormDescription>
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
              
              <FormField
                control={form.control}
                name="is_admin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Company Admin</FormLabel>
                      <FormDescription>
                        Can manage company
                      </FormDescription>
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
            </div>
            
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
