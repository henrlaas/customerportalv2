
import { useState } from 'react';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

// Form schema
const contactFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  first_name: z.string().min(1, { message: 'First name is required' }),
  last_name: z.string().min(1, { message: 'Last name is required' }),
  position: z.string().optional(),
  is_primary: z.boolean().default(false),
  is_admin: z.boolean().default(false),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

type CreateContactDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
};

export const CreateContactDialog = ({
  isOpen,
  onClose,
  companyId,
}: CreateContactDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(true);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      position: '',
      is_primary: false,
      is_admin: false,
    },
  });
  
  // Create user and add as contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      // First, invite the user through edge function
      const { data, error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'invite',
          email: values.email,
          userData: {
            first_name: values.first_name,
            last_name: values.last_name,
            role: isClient ? 'client' : 'employee',
          },
        },
      });
      
      if (error) throw new Error(error.message);
      if (!data?.user?.id) throw new Error('Failed to create user');
      
      // Then add user as company contact
      const contactData = await companyService.addCompanyContact({
        company_id: companyId,
        user_id: data.user.id,
        position: values.position || null,
        is_primary: values.is_primary,
        is_admin: values.is_admin,
      });
      
      return contactData;
    },
    onSuccess: () => {
      toast({
        title: 'Contact added',
        description: 'The contact has been added and invitation email sent',
      });
      queryClient.invalidateQueries({ queryKey: ['companyContacts', companyId] });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add contact: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (values: ContactFormValues) => {
    createContactMutation.mutate(values);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Add a new contact to this company. An invitation email will be sent.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted mb-2">
              <span>Contact type:</span>
              <div className="flex items-center space-x-2">
                <Button 
                  type="button"
                  size="sm"
                  variant={isClient ? "default" : "outline"} 
                  onClick={() => setIsClient(true)}
                >
                  Client
                </Button>
                <Button 
                  type="button"
                  size="sm"
                  variant={!isClient ? "default" : "outline"} 
                  onClick={() => setIsClient(false)}
                >
                  Employee
                </Button>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
                disabled={createContactMutation.isPending}
              >
                {createContactMutation.isPending ? 'Adding...' : 'Add Contact'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
