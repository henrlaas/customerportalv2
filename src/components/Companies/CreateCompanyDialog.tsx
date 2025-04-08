
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
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Form schema
const companyFormSchema = z.object({
  name: z.string().min(1, { message: 'Company name is required' }),
  website: z.string().url().or(z.literal('')).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo_url: z.string().url().or(z.literal('')).optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

type CreateCompanyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string;
};

export const CreateCompanyDialog = ({
  isOpen,
  onClose,
  parentId,
}: CreateCompanyDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      website: '',
      phone: '',
      address: '',
      logo_url: '',
    },
  });
  
  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: (values: CompanyFormValues) => companyService.createCompany({
      ...values,
      parent_id: parentId || null,
    }),
    onSuccess: () => {
      toast({
        title: 'Company created',
        description: 'The company has been created successfully',
      });
      if (parentId) {
        queryClient.invalidateQueries({ queryKey: ['childCompanies', parentId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['companies'] });
      }
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create company: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (values: CompanyFormValues) => {
    createCompanyMutation.mutate(values);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{parentId ? 'Add Subsidiary' : 'Create New Company'}</DialogTitle>
          <DialogDescription>
            {parentId 
              ? 'Add a new subsidiary to this company.' 
              : 'Add a new company to your database.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corporation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, City, Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={createCompanyMutation.isPending}
              >
                {createCompanyMutation.isPending ? 'Creating...' : 'Create Company'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
