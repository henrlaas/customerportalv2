
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Building, User, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MultiStageProjectContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  companyId: string;
  projectName: string;
}

export const MultiStageProjectContractDialog: React.FC<MultiStageProjectContractDialogProps> = ({
  isOpen,
  onClose,
  projectId,
  companyId,
  projectName
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    templateType: '',
    contactId: '',
    customContent: ''
  });

  const queryClient = useQueryClient();

  // Fetch contract templates
  const { data: templates = [] } = useQuery({
    queryKey: ['contract-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch company contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['company-contacts', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_contacts')
        .select(`
          *,
          profiles (
            id,
            first_name,
            last_name
          )
        `)
        .eq('company_id', companyId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });

  // Create contract mutation
  const createContract = useMutation({
    mutationFn: async (contractData: any) => {
      const { data, error } = await supabase
        .from('contracts')
        .insert(contractData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Contract created successfully');
      // Invalidate both project contracts and project contract queries
      queryClient.invalidateQueries({ queryKey: ['project-contracts', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-contract', projectId] });
      onClose();
      setCurrentStep(1);
      setFormData({
        title: '',
        templateType: '',
        contactId: '',
        customContent: ''
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to create contract: ${error.message}`);
    }
  });

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.templateType || !formData.contactId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedTemplate = templates.find(t => t.id === formData.templateType);
    const content = formData.customContent || selectedTemplate?.content || '';

    createContract.mutate({
      title: formData.title,
      template_type: selectedTemplate?.type || 'custom',
      content: content,
      company_id: companyId,
      contact_id: formData.contactId,
      project_id: projectId,
      status: 'unsigned'
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="contract-title">Contract Title</Label>
              <Input
                id="contract-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={`${projectName} Contract`}
              />
            </div>
            
            <div>
              <Label htmlFor="template-select">Contract Template</Label>
              <Select value={formData.templateType} onValueChange={(value) => setFormData(prev => ({ ...prev, templateType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contact-select">Primary Contact</Label>
              <Select value={formData.contactId} onValueChange={(value) => setFormData(prev => ({ ...prev, contactId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.profiles?.first_name} {contact.profiles?.last_name} - {contact.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        const selectedTemplate = templates.find(t => t.id === formData.templateType);
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-content">Contract Content</Label>
              <Textarea
                id="custom-content"
                value={formData.customContent || selectedTemplate?.content || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, customContent: e.target.value }))}
                placeholder="Enter custom contract content or modify the template..."
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can customize the template content above or use it as-is.
              </p>
            </div>
          </div>
        );

      case 3:
        const selectedContact = contacts.find(c => c.id === formData.contactId);
        const selectedTemplateForReview = templates.find(t => t.id === formData.templateType);
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Contract Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Title</p>
                    <p className="font-medium">{formData.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Template</p>
                    <p className="font-medium">{selectedTemplateForReview?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Unsigned
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Primary Contact</p>
                    <p className="font-medium">
                      {selectedContact?.profiles?.first_name} {selectedContact?.profiles?.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Position</p>
                    <p className="font-medium">{selectedContact?.position}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Contract Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded border max-h-40 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {formData.customContent || selectedTemplateForReview?.content || 'No content available'}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Contract & Contact Details';
      case 2: return 'Contract Content';
      case 3: return 'Review & Confirm';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Project Contract - {getStepTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {currentStep > step ? <CheckCircle className="h-4 w-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`
                    w-16 h-1 mx-2
                    ${currentStep > step ? 'bg-primary' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onClose : handleBack}
              disabled={createContract.isPending}
            >
              {currentStep === 1 ? (
                'Cancel'
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </>
              )}
            </Button>

            {currentStep < 3 ? (
              <Button 
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && (!formData.title || !formData.templateType || !formData.contactId)) ||
                  createContract.isPending
                }
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={createContract.isPending}
              >
                {createContract.isPending ? 'Creating...' : 'Create Contract'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
