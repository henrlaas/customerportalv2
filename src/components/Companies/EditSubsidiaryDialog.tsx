
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Building, Globe } from 'lucide-react';
import * as z from 'zod';
import type { Company } from '@/types/company';

const subsidiaryFormSchema = z.object({
  name: z.string().min(1, { message: 'Company name is required' }),
  organization_number: z.string().optional(),
  website: z.string().url().or(z.literal('')).optional(),
});

type SubsidiaryFormValues = z.infer<typeof subsidiaryFormSchema>;

interface EditSubsidiaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subsidiary: Company;
}

export const EditSubsidiaryDialog = ({
  isOpen,
  onClose,
  subsidiary,
}: EditSubsidiaryDialogProps) => {
  const [logo, setLogo] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<SubsidiaryFormValues>({
    resolver: zodResolver(subsidiaryFormSchema),
    defaultValues: {
      name: '',
      organization_number: '',
      website: '',
    },
  });

  const website = form.watch('website');
  
  // Update form when subsidiary data changes
  useEffect(() => {
    if (subsidiary) {
      form.reset({
        name: subsidiary.name || '',
        organization_number: subsidiary.organization_number || '',
        website: subsidiary.website || '',
      });
      setLogo(subsidiary.logo_url || null);
    }
  }, [subsidiary, form]);

  // Fetch logo when website changes
  useEffect(() => {
    if (website && website !== subsidiary?.website) {
      const fetchLogo = async () => {
        try {
          const faviconUrl = await companyService.fetchFavicon(website);
          if (faviconUrl) {
            setLogo(faviconUrl);
          }
        } catch (error) {
          console.error('Failed to fetch favicon:', error);
        }
      };
      fetchLogo();
    }
  }, [website, subsidiary?.website]);
  
  // Update subsidiary mutation
  const updateSubsidiaryMutation = useMutation({
    mutationFn: async (values: SubsidiaryFormValues) => {
      const subsidiaryData = {
        name: values.name,
        organization_number: values.organization_number || null,
        website: values.website || null,
        logo_url: logo,
      };
      return companyService.updateCompany(subsidiary.id, subsidiaryData);
    },
    onSuccess: () => {
      toast({
        title: 'Subsidiary updated',
        description: 'The subsidiary has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['company', subsidiary.id] });
      queryClient.invalidateQueries({ queryKey: ['childCompanies', subsidiary.parent_id] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update subsidiary: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (values: SubsidiaryFormValues) => {
    updateSubsidiaryMutation.mutate(values);
  };

  const handleClose = () => {
    form.reset();
    setLogo(null);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Subsidiary</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                {logo ? (
                  <img 
                    src={logo} 
                    alt="Company Logo" 
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <Building className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">
                  Editing subsidiary details
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="organization_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter organization number" {...field} />
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
                  <FormLabel className="flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Website
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateSubsidiaryMutation.isPending}
              >
                {updateSubsidiaryMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
