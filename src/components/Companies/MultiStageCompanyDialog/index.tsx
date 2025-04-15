import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { userService } from '@/services/userService';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  defaultValues?: Partial<CompanyFormValues>;
  dealId?: string;
};

export function MultiStageCompanyDialog({
  isOpen,
  onClose,
  parentId,
  defaultValues,
  dealId,
}: MultiStageCompanyDialogProps) {
  const [stage, setStage] = useState(1);
  const [logo, setLogo] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
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
      ...defaultValues, // Merge any provided default values
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
    mutationFn: async (values: CompanyFormValues) => {
      // Format values for submission
      const companyData = {
        ...values,
        logo_url: logo,
        parent_id: values.parent_id || null,
        client_types: values.client_types,
        mrr: hasMarketingType ? values.mrr : null,
      };
      
      if (dealId) {
        // If we're converting a temporary company, use the conversion function
        const { data, error } = await supabase.rpc('convert_temp_deal_company', {
          deal_id_param: dealId,
          name_param: values.name,
          organization_number_param: values.organization_number || null,
          is_marketing_param: values.client_types.includes('Marketing'),
          is_web_param: values.client_types.includes('Web'),
          website_param: values.website || null,
          phone_param: values.phone || null,
          invoice_email_param: values.invoice_email || null,
          street_address_param: values.street_address || null,
          city_param: values.city || null,
          postal_code_param: values.postal_code || null,
          country_param: values.country || null,
          advisor_id_param: values.advisor_id || null,
          mrr_param: values.mrr || 0,
          trial_period_param: values.trial_period,
          is_partner_param: values.is_partner,
          created_by_param: user?.id || null
        });
        
        if (error) throw error;
        return data;
      } else {
        // Regular company creation
        return companyService.createCompany(companyData);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: dealId 
          ? 'Temporary company converted successfully' 
          : 'Company created successfully',
      });
      
      // Invalidate necessary queries
      if (dealId) {
        queryClient.invalidateQueries({ queryKey: ['deals'] });
        queryClient.invalidateQueries({ queryKey: ['temp-deal-companies'] });
      }
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
        description: dealId 
          ? `Failed to convert company: ${error.message}`
          : `Failed to create company: ${error.message}`,
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
