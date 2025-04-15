
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { userService } from '@/services/userService';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Form schema
const contactFormSchema = z.object({
  user_id: z.string().min(1, { message: 'User ID is required' }),
  position: z.string().optional(),
  is_primary: z.boolean().default(false),
  is_admin: z.boolean().default(false),
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
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      user_id: '',
      position: '',
      is_primary: false,
      is_admin: false,
    },
  });
  
  // Fetch users
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.listUsers(),
  });
  
  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: (contactData: ContactFormValues & { company_id: string }) => {
      return companyService.createContact({
        ...contactData,
        company_id: companyId,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Contact added',
        description: 'The contact has been added successfully',
      });
      
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
  
  const onSubmit = (values: ContactFormValues) => {
    createContactMutation.mutate({
      ...values,
      company_id: companyId,
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Assign a user to this company as a contact.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select an existing user to assign as a contact.
                  </FormDescription>
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
