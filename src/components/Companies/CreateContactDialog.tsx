
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

// Form schema - all fields are now required
const contactFormSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Valid email is required' }),
  phoneNumber: z.string().min(1, { message: 'Phone number is required' }),
  position: z.string().min(1, { message: 'Position is required' }),
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
      phoneNumber: '',
      position: '',
    },
  });
  
  const onSubmit = async (values: ContactFormValues) => {
    try {
      setIsSubmitting(true);
      
      console.log('Inviting company contact:', values.email);
      
      const { data, error } = await supabase.functions.invoke('invite-company-contact', {
        body: {
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber,
          position: values.position,
          companyId: companyId
        }
      });
      
      if (error) {
        console.error('Error inviting contact:', error);
        throw new Error(`Failed to invite contact: ${error.message}`);
      }
      
      console.log('Contact invited successfully:', data);
      
      toast({
        title: 'Contact invited successfully',
        description: `${values.firstName} ${values.lastName} has been invited and will receive an email to set their password.`,
      });
      
      form.reset();
      onClose();
      
      if (onSuccess) onSuccess();
      queryClient.invalidateQueries({ queryKey: ['companyContacts', companyId] });
      
    } catch (error) {
      console.error('Error in contact invitation process:', error);
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
            Invite a new contact to join this company. They will receive an email invitation to set their password.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} required />
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
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} required />
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
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <PhoneInput
                      country={'no'}
                      value={field.value}
                      onChange={field.onChange}
                      inputStyle={{
                        width: '100%',
                        height: '40px',
                        fontSize: '14px',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        paddingLeft: '48px',
                        backgroundColor: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))',
                      }}
                      buttonStyle={{
                        border: '1px solid hsl(var(--border))',
                        borderRight: 'none',
                        borderRadius: '6px 0 0 6px',
                        backgroundColor: 'hsl(var(--background))',
                      }}
                      dropdownStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        zIndex: 50,
                      }}
                      searchStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '4px',
                        color: 'hsl(var(--foreground))',
                      }}
                      placeholder="Enter phone number"
                    />
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
                  <FormLabel>Position *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. CEO" {...field} required />
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
                {isSubmitting ? 'Inviting...' : 'Invite Contact'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
