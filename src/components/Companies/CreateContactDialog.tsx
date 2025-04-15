
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useInviteUser } from '@/hooks/useInviteUser';

// Form schema
const contactFormSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Valid email is required' }),
  position: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

type CreateContactDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onSuccess?: () => void;
};

export const CreateContactDialog = ({
  isOpen,
  onClose,
  companyId,
  onSuccess,
}: CreateContactDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      position: '',
    },
  });
  
  // Use invite user hook for creating and inviting users
  const { mutateAsync: inviteUser } = useInviteUser({});
  
  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: async (contactData: { 
      company_id: string; 
      user_id: string; 
      position?: string;
      is_primary?: boolean;
      is_admin?: boolean;
    }) => {
      return companyService.createContact(contactData);
    },
    onSuccess: () => {
      // Reset form
      form.reset();
      
      // Notify parent component
      if (onSuccess) onSuccess();
      
      // Close dialog
      onClose();
      
      // Refetch company contacts
      queryClient.invalidateQueries({ queryKey: ['companyContacts', companyId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add contact: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const onSubmit = async (values: ContactFormValues) => {
    try {
      setIsSubmitting(true);
      
      // First, invite the user with client role
      const inviteResponse = await inviteUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        role: 'client', // Always set to client role
        language: 'en'
      });
      
      // Then create the company contact with the newly created user's ID
      if (inviteResponse && inviteResponse.user && inviteResponse.user.id) {
        await createContactMutation.mutateAsync({
          company_id: companyId,
          user_id: inviteResponse.user.id,
          position: values.position,
          is_primary: false,
          is_admin: false,
        });
        
        toast({
          title: 'Contact added',
          description: `${values.firstName} ${values.lastName} has been invited and added as a company contact.`,
        });
      } else {
        throw new Error('Failed to invite user');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Create and invite a new contact for this company. They will receive an email invitation to join.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. CEO" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Contact'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
