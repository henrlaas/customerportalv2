
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { userService } from '@/services/userService';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { companyFormSchema, CompanyFormValues } from './types';
import { CompanyBasicInfoForm } from './CompanyBasicInfoForm';
import { CompanyContactForm } from './CompanyContactForm';
import { CompanyAddressSettingsForm } from './CompanyAddressSettingsForm';

const CLIENT_TYPES = {
  MARKETING: 'Marketing',
  WEB: 'Web',
};

type MultiStageCompanyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string;
};

export function MultiStageCompanyDialog({
  isOpen,
  onClose,
  parentId,
}: MultiStageCompanyDialogProps) {
  const [stage, setStage] = useState(1);
  const [logo, setLogo] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const totalStages = 3;
  
  // Fix: Change getUsers to listUsers to match the userService API
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.listUsers(),
  });
  
  // Create form with all fields
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      organization_number: '',
      client_types: [CLIENT_TYPES.MARKETING],
      website: '',
      phone: '',
      invoice_email: '',
      street_address: '',
      city: '',
      postal_code: '',
      country: '',
      parent_id: parentId || '',
      trial_period: false,
      is_partner: false,
      advisor_id: '',
      mrr: 0,
    },
  });

  // Watch for website changes to fetch favicon
  const website = form.watch('website');
  const clientTypes = form.watch('client_types');
  const hasMarketingType = clientTypes?.includes(CLIENT_TYPES.MARKETING);
  
  useEffect(() => {
    if (website) {
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
  }, [website]);
  
  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: (values: CompanyFormValues) => {
      // Format values for submission
      const companyData = {
        ...values,
        logo_url: logo,
        parent_id: values.parent_id || null,
        // Pass client_types directly - the service will handle conversion
        client_types: values.client_types,
        mrr: hasMarketingType ? values.mrr : null, // Only include MRR if Marketing is selected
      };
      
      return companyService.createCompany(companyData);
    },
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
      
      // Reset form and close dialog
      form.reset();
      setStage(1);
      setLogo(null);
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
    if (stage < totalStages) {
      setStage(stage + 1);
    } else {
      createCompanyMutation.mutate(values);
    }
  };
  
  const goBack = () => {
    if (stage > 1) {
      setStage(stage - 1);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{parentId ? 'Add Subsidiary' : 'New Company'}</DialogTitle>
          <DialogDescription>
            Step {stage} of {totalStages}: {
              stage === 1 ? 'Basic Information' : 
              stage === 2 ? 'Contact Details' : 
              'Address & Settings'
            }
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2.5 mb-4">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(stage / totalStages) * 100}%` }}
          ></div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Stage 1: Basic Information */}
            {stage === 1 && (
              <CompanyBasicInfoForm form={form} logo={logo} />
            )}
            
            {/* Stage 2: Contact Details */}
            {stage === 2 && (
              <CompanyContactForm form={form} />
            )}
            
            {/* Stage 3: Address & Settings */}
            {stage === 3 && (
              <CompanyAddressSettingsForm 
                form={form} 
                users={users} 
                hasMarketingType={hasMarketingType} 
              />
            )}
            
            <DialogFooter className="flex justify-between pt-4 sm:justify-between">
              <div>
                {stage > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={goBack}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className={cn(
                    "flex items-center gap-1",
                    stage === totalStages ? "" : "bg-secondary hover:bg-secondary/80"
                  )}
                  disabled={createCompanyMutation.isPending}
                >
                  {createCompanyMutation.isPending 
                    ? 'Creating...' 
                    : stage === totalStages 
                      ? 'Create Company' 
                      : (
                        <>
                          Next <ChevronRight className="h-4 w-4" />
                        </>
                      )
                  }
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
