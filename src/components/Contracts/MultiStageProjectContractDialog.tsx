
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProgressStepper } from '@/components/ui/progress-stepper';
import { Form } from '@/components/ui/form';
import { ContractTitleContactStage } from './MultiStageProjectContractDialog/ContractTitleContactStage';
import { ProjectContractConfirmationStage } from './MultiStageProjectContractDialog/ProjectContractConfirmationStage';
import { createContract, replacePlaceholders } from '@/utils/contractUtils';

const projectContractSchema = z.object({
  title: z.string().min(1, { message: 'Contract title is required' }),
  contact_id: z.string().min(1, { message: 'Company contact is required' }),
});

type ProjectContractFormValues = z.infer<typeof projectContractSchema>;

interface MultiStageProjectContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  companyId: string;
  projectName: string;
}

export function MultiStageProjectContractDialog({ 
  isOpen, 
  onClose, 
  projectId, 
  companyId, 
  projectName 
}: MultiStageProjectContractDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const form = useForm<ProjectContractFormValues>({
    resolver: zodResolver(projectContractSchema),
    defaultValues: {
      title: `${projectName} - Project Agreement`,
      contact_id: '',
    },
  });

  // Fetch project template - Fixed to use "Project" instead of "project"
  const { data: projectTemplate, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ['contract-template', 'Project'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('type', 'Project')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching project template:', error);
        throw error;
      }
      
      return data;
    },
  });

  // Fetch company contacts using the proven two-step approach
  const { data: companyContacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ['company-contacts', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      try {
        // Step 1: Get company contacts
        const { data: companyContactsData, error: contactsError } = await supabase
          .from('company_contacts')
          .select('id, user_id, position')
          .eq('company_id', companyId);
        
        if (contactsError) {
          console.error('Error fetching company contacts:', contactsError);
          throw contactsError;
        }
        
        if (!companyContactsData || companyContactsData.length === 0) {
          console.log('No company contacts found for company:', companyId);
          return [];
        }
        
        // Step 2: Get profile information for each contact
        const userIds = companyContactsData.map(contact => contact.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .in('id', userIds);
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }
        
        // Step 3: Combine the data
        const combinedData = companyContactsData.map(contact => {
          const profile = profiles?.find(p => p.id === contact.user_id);
          return {
            id: contact.id,
            user_id: contact.user_id,
            position: contact.position,
            profiles: {
              first_name: profile?.first_name || null,
              last_name: profile?.last_name || null,
              avatar_url: profile?.avatar_url || null,
            }
          };
        });
        
        console.log('Successfully fetched company contacts:', combinedData);
        return combinedData;
      } catch (error) {
        console.error('Error in company contacts query:', error);
        throw error;
      }
    },
    enabled: !!companyId,
  });

  // Fetch company data for contract placeholders
  const { data: companyData } = useQuery({
    queryKey: ['company-data', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
      
      if (error) {
        console.error('Error fetching company data:', error);
        throw error;
      }
      
      return data;
    },
  });

  // Fetch project data for contract placeholders
  const { data: projectData } = useQuery({
    queryKey: ['project-data', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) {
        console.error('Error fetching project data:', error);
        throw error;
      }
      
      return data;
    },
  });

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (values: ProjectContractFormValues) => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      if (!projectTemplate) {
        throw new Error("No project template found. Please create a project template first.");
      }

      // Prepare placeholder data for replacement
      const placeholderData = {
        company: companyData,
        contact: {
          first_name: selectedContact?.profiles?.first_name,
          last_name: selectedContact?.profiles?.last_name,
          position: selectedContact?.position,
        },
        project: projectData,
      };

      // Process the template content with placeholders replaced
      const processedContent = replacePlaceholders(projectTemplate.content, placeholderData);
      
      const contractData = {
        title: values.title,
        company_id: companyId,
        contact_id: values.contact_id,
        project_id: projectId,
        template_type: 'Project',
        content: processedContent, // Use processed content instead of raw template
        created_by: user.id,
      };
      
      return await createContract(contractData);
    },
    onSuccess: () => {
      toast.success('Project contract created successfully');
      queryClient.invalidateQueries({ queryKey: ['project-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      // Invalidate the specific project contract query to update the card immediately
      queryClient.invalidateQueries({ queryKey: ['project-contract', projectId] });
      form.reset();
      setCurrentStep(1);
      onClose();
    },
    onError: (error: Error) => {
      console.error('Error creating contract:', error);
      toast.error(`Failed to create contract: ${error.message}`);
    },
  });

  // Handle step navigation
  const goToNextStep = async () => {
    if (currentStep === 1) {
      const isValid = await form.trigger(['title', 'contact_id']);
      if (isValid) {
        setCurrentStep(2);
      }
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit handler
  const onSubmit = (values: ProjectContractFormValues) => {
    if (currentStep < totalSteps) {
      goToNextStep();
    } else {
      createContractMutation.mutate(values);
    }
  };

  // Get selected contact data
  const selectedContact = companyContacts.find(
    contact => contact.id === form.watch('contact_id')
  );

  // Handle dialog close
  const handleDialogClose = () => {
    setCurrentStep(1);
    form.reset();
    onClose();
  };

  // Show error if no template exists
  if (!isLoadingTemplate && !projectTemplate) {
    return (
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cannot Create Contract</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-muted-foreground mb-4">
              No project contract template found. Please create a project template first.
            </p>
            <Button onClick={handleDialogClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Project Contract</DialogTitle>
        </DialogHeader>

        <ProgressStepper currentStep={currentStep} totalSteps={totalSteps} />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && (
              <ContractTitleContactStage 
                form={form}
                companyContacts={companyContacts}
                isLoadingContacts={isLoadingContacts}
              />
            )}
            
            {currentStep === 2 && (
              <ProjectContractConfirmationStage 
                form={form}
                selectedContact={selectedContact}
                projectTemplate={projectTemplate}
                companyData={companyData}
                projectData={projectData}
                isLoadingTemplate={isLoadingTemplate}
              />
            )}
            
            <DialogFooter className="flex justify-between pt-4 sm:justify-between">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex items-center gap-1"
                  disabled={createContractMutation.isPending}
                >
                  {createContractMutation.isPending 
                    ? 'Creating...' 
                    : currentStep === totalSteps 
                      ? 'Create Contract' 
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
