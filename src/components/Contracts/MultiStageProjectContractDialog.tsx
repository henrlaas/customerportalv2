
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
import { ContractTitleContactStage } from './MultiStageProjectContractDialog/ContractTitleContactStage';
import { ProjectContractConfirmationStage } from './MultiStageProjectContractDialog/ProjectContractConfirmationStage';
import { createContract } from '@/utils/contractUtils';

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

  // Fetch project template
  const { data: projectTemplate, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ['contract-template', 'project'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .eq('type', 'project')
        .single();
      
      if (error) {
        console.error('Error fetching project template:', error);
        throw error;
      }
      
      return data;
    },
  });

  // Fetch company contacts
  const { data: companyContacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ['company-contacts', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_contacts')
        .select(`
          id,
          user_id,
          position,
          profiles:user_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('company_id', companyId);
      
      if (error) {
        console.error('Error fetching company contacts:', error);
        throw error;
      }
      
      return data || [];
    },
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
      if (!user || !projectTemplate) {
        throw new Error("Missing required data");
      }
      
      const contractData = {
        title: values.title,
        company_id: companyId,
        contact_id: values.contact_id,
        project_id: projectId,
        template_type: 'project',
        content: projectTemplate.content,
        created_by: user.id,
      };
      
      return await createContract(contractData);
    },
    onSuccess: () => {
      toast.success('Project contract created successfully');
      queryClient.invalidateQueries({ queryKey: ['project-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
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

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Project Contract</DialogTitle>
        </DialogHeader>

        <ProgressStepper currentStep={currentStep} totalSteps={totalSteps} />
        
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
      </DialogContent>
    </Dialog>
  );
}
