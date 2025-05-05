
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
} from '@/components/ui/dialog';
import { useEffect } from 'react';

// Form schema
const companyFormSchema = z.object({
  name: z.string().min(1, { message: 'Company name is required' }),
  website: z.string().url().or(z.literal('')).optional(),
  phone: z.string().optional(),
  street_address: z.string().optional(), // Changed from address to street_address
  logo_url: z.string().url().or(z.literal('')).optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

type EditCompanyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
};

export const EditCompanyDialog = ({
  isOpen,
  onClose,
  companyId,
}: EditCompanyDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      website: '',
      phone: '',
      street_address: '',
      logo_url: '',
    },
  });
  
  // Fetch company data - use fetchCompanyById instead of getCompany
  const { data: company, isLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyService.fetchCompanyById(companyId),
    enabled: isOpen && !!companyId,
  });
  
  // Update form when company data loads
  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        website: company.website || '',
        phone: company.phone || '',
        street_address: company.street_address || '',
        logo_url: company.logo_url || '',
      });
    }
  }, [company, form]);
  
  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: (values: CompanyFormValues) => companyService.updateCompany(companyId, values),
    onSuccess: () => {
      toast({
        title: 'Company updated',
        description: 'The company has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['company', companyId] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['childCompanies'] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update company: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (values: CompanyFormValues) => {
    updateCompanyMutation.mutate(values);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
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
                    <Input {...field} />
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
                    <Input {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="street_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={updateCompanyMutation.isPending}
              >
                {updateCompanyMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
