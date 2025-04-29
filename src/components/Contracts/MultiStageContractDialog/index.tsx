
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProgressStepper } from './ProgressStepper';
import { BasicInfoStep } from './BasicInfoStep';
import { FileUploadStep } from './FileUploadStep';
import { CompanySelectionStep } from './CompanySelectionStep';
import { ReviewStep } from './ReviewStep';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface MultiStageContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Define the steps in the creation process
const steps = [
  { id: "basics", label: "Basic Info" },
  { id: "company", label: "Company" },
  { id: "file", label: "Contract Document" },
  { id: "review", label: "Review" },
];

export const MultiStageContractDialog: React.FC<MultiStageContractDialogProps> = ({ 
  open, 
  onOpenChange,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [contractData, setContractData] = React.useState({
    title: '',
    value: '',
    status: 'draft',
    start_date: '',
    end_date: '',
    company_id: '',
    file_url: ''
  });
  const { toast } = useToast();
  
  // Fetch companies for selection
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    enabled: open && currentStep === 1, // Only fetch when dialog is open and on company step
  });

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Insert into contracts table
      const { data, error } = await supabase
        .from('contracts')
        .insert({
          title: contractData.title,
          value: contractData.value ? parseFloat(contractData.value) : null,
          status: contractData.status,
          start_date: contractData.start_date || null,
          end_date: contractData.end_date || null,
          company_id: contractData.company_id,
          file_url: contractData.file_url || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Contract has been created successfully."
      });

      // Reset form and close dialog
      setContractData({
        title: '',
        value: '',
        status: 'draft',
        start_date: '',
        end_date: '',
        company_id: '',
        file_url: ''
      });
      setCurrentStep(0);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create contract",
        variant: "destructive",
      });
    }
  };

  // Update contract data
  const updateContractData = (data: Partial<typeof contractData>) => {
    setContractData(prev => ({ ...prev, ...data }));
  };

  // Handle navigation between steps
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    setCurrentStep(0);
    setContractData({
      title: '',
      value: '',
      status: 'draft',
      start_date: '',
      end_date: '',
      company_id: '',
      file_url: ''
    });
    onOpenChange(false);
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep 
            contractData={contractData} 
            updateContractData={updateContractData}
          />
        );
      case 1:
        return (
          <CompanySelectionStep 
            contractData={contractData} 
            updateContractData={updateContractData}
            companies={companies}
          />
        );
      case 2:
        return (
          <FileUploadStep 
            contractData={contractData} 
            updateContractData={updateContractData}
          />
        );
      case 3:
        return (
          <ReviewStep 
            contractData={contractData}
            companies={companies}
          />
        );
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 0:
        return !contractData.title;
      case 1:
        return !contractData.company_id;
      case 2:
        return false; // File is optional
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="space-y-6">
          <ProgressStepper 
            steps={steps} 
            currentStep={currentStep} 
          />
          
          <div className="min-h-[300px]">
            {renderStepContent()}
          </div>
          
          <div className="flex justify-between">
            <div>
              {currentStep > 0 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={isNextDisabled()}
              >
                {currentStep === steps.length - 1 ? "Create Contract" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultiStageContractDialog;
