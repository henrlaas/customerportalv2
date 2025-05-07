
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { PlusCircle, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  ContractTemplate,
  createContract,
  fetchContractTemplates,
  replacePlaceholders
} from '@/utils/contractUtils';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardDescription } from '@/components/ui/card';

interface CreateContractDialogProps {
  onContractCreated?: () => void;
}

export function CreateContractDialog({ onContractCreated }: CreateContractDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Fetch contract templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['contractTemplates'],
    queryFn: () => fetchContractTemplates(),
  });
  
  // Fetch companies
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
  
  // Fetch contacts when company is selected
  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ['companyContacts', selectedCompany?.id],
    queryFn: async () => {
      if (!selectedCompany?.id) return [];
      
      const { data, error } = await supabase
        .from('company_contacts')
        .select(`
          id,
          user_id,
          position,
          is_primary,
          profiles:user_id (first_name, last_name)
        `)
        .eq('company_id', selectedCompany.id);
      
      if (error) throw error;
      
      // Get emails for contacts
      const userIds = data.map((contact: any) => contact.user_id);
      const { data: emailsData } = await supabase.rpc('get_users_email', { user_ids: userIds });
      
      if (emailsData) {
        const emailMap = new Map(emailsData.map((item: any) => [item.id, item.email]));
        
        // Add email to contact data
        data.forEach((contact: any) => {
          if (contact.user_id) {
            contact.email = emailMap.get(contact.user_id);
          }
        });
      }
      
      return data;
    },
    enabled: !!selectedCompany?.id,
  });
  
  // Fetch projects
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
  
  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTemplate || !selectedCompany || !selectedContact || !user) {
        throw new Error('Missing required fields');
      }
      
      // Get company details for placeholders
      const { data: companyDetails } = await supabase
        .from('companies')
        .select('*')
        .eq('id', selectedCompany.id)
        .single();
      
      // Get contact details for placeholders
      let contactDetails = { ...selectedContact };
      
      // Replace placeholders in contract text
      const content = replacePlaceholders(selectedTemplate.content, {
        company: companyDetails,
        contact: contactDetails
      });
      
      const title = `${selectedTemplate.type} - ${selectedCompany.name}`;
      
      // Create the contract
      return await createContract({
        company_id: selectedCompany.id,
        contact_id: selectedContact.id,
        project_id: selectedProject?.id || null,
        template_type: selectedTemplate.type,
        content: content,
        title: title,
        created_by: user.id,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Contract created',
        description: 'The contract has been successfully created.',
      });
      
      if (onContractCreated) {
        onContractCreated();
      }
      
      setOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating contract',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const resetForm = () => {
    setStep(1);
    setSelectedTemplate(null);
    setSelectedCompany(null);
    setSelectedContact(null);
    setSelectedProject(null);
  };
  
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };
  
  const stepContent = () => {
    switch (step) {
      case 1: // Template selection
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Choose a contract template to use.</p>
            
            <Tabs defaultValue="DPA">
              <TabsList>
                <TabsTrigger value="DPA">DPA</TabsTrigger>
                <TabsTrigger value="NDA">NDA</TabsTrigger>
                <TabsTrigger value="Web">Web</TabsTrigger>
                <TabsTrigger value="Marketing">Marketing</TabsTrigger>
              </TabsList>
              
              <div className="mt-4 grid grid-cols-1 gap-4">
                {templates
                  .filter((template) => template.type === (templates.find((t) => t.type === 'DPA') ? 'DPA' : ''))
                  .map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer p-4 ${
                        selectedTemplate?.id === template.id ? 'border-primary ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <h3 className="font-medium">{template.name}</h3>
                      <CardDescription>
                        Created {format(new Date(template.created_at), 'MMM d, yyyy')}
                      </CardDescription>
                    </Card>
                  ))}
              </div>
              
              <TabsContent value="DPA">
                <div className="grid grid-cols-1 gap-4">
                  {templates
                    .filter((template) => template.type === 'DPA')
                    .map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer p-4 ${
                          selectedTemplate?.id === template.id ? 'border-primary ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <h3 className="font-medium">{template.name}</h3>
                        <CardDescription>
                          Created {format(new Date(template.created_at), 'MMM d, yyyy')}
                        </CardDescription>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="NDA">
                <div className="grid grid-cols-1 gap-4">
                  {templates
                    .filter((template) => template.type === 'NDA')
                    .map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer p-4 ${
                          selectedTemplate?.id === template.id ? 'border-primary ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <h3 className="font-medium">{template.name}</h3>
                        <CardDescription>
                          Created {format(new Date(template.created_at), 'MMM d, yyyy')}
                        </CardDescription>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="Web">
                <div className="grid grid-cols-1 gap-4">
                  {templates
                    .filter((template) => template.type === 'Web')
                    .map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer p-4 ${
                          selectedTemplate?.id === template.id ? 'border-primary ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <h3 className="font-medium">{template.name}</h3>
                        <CardDescription>
                          Created {format(new Date(template.created_at), 'MMM d, yyyy')}
                        </CardDescription>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="Marketing">
                <div className="grid grid-cols-1 gap-4">
                  {templates
                    .filter((template) => template.type === 'Marketing')
                    .map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer p-4 ${
                          selectedTemplate?.id === template.id ? 'border-primary ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <h3 className="font-medium">{template.name}</h3>
                        <CardDescription>
                          Created {format(new Date(template.created_at), 'MMM d, yyyy')}
                        </CardDescription>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );
      
      case 2: // Company selection
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select a company for the contract.</p>
            
            <Select value={selectedCompany?.id || ''} onValueChange={(value) => {
              const company = companies.find((c) => c.id === value);
              setSelectedCompany(company || null);
              setSelectedContact(null); // Reset contact when company changes
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      case 3: // Contact selection
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a contact from {selectedCompany?.name} who will receive and sign the contract.
            </p>
            
            {isLoadingContacts ? (
              <div className="text-center py-4">Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-4">No contacts found for this company.</div>
            ) : (
              <Select value={selectedContact?.id || ''} onValueChange={(value) => {
                const contact = contacts.find((c) => c.id === value);
                setSelectedContact(contact || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact: any) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.profiles.first_name} {contact.profiles.last_name} ({contact.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        );
      
      case 4: // Project selection (optional)
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Optionally, you can associate this contract with a project.
            </p>
            
            <Select value={selectedProject?.id || ''} onValueChange={(value) => {
              if (value === '') {
                setSelectedProject(null);
                return;
              }
              
              const project = projects.find((p) => p.id === value);
              setSelectedProject(project || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      case 5: // Summary/confirmation
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please review the contract details before creating it.
            </p>
            
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="font-medium">Template:</p>
                  <p>{selectedTemplate?.name}</p>
                </div>
                <div>
                  <p className="font-medium">Company:</p>
                  <p>{selectedCompany?.name}</p>
                </div>
                <div>
                  <p className="font-medium">Contact:</p>
                  <p>
                    {selectedContact?.profiles?.first_name} {selectedContact?.profiles?.last_name}
                    {selectedContact?.email && <span> ({selectedContact.email})</span>}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Project:</p>
                  <p>{selectedProject?.name || 'None'}</p>
                </div>
              </div>
              
              <p className="text-xs mt-4">
                The contract will be created and the contact will be notified that a contract is ready for them to sign.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedTemplate;
      case 2:
        return !!selectedCompany;
      case 3:
        return !!selectedContact;
      case 4:
        return true; // Project is optional
      case 5:
        return true; // Confirmation step
      default:
        return false;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Contract</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new contract.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {/* Stepper indicator */}
          <div className="flex justify-between items-center mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === i
                    ? 'bg-primary text-primary-foreground'
                    : step > i
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > i ? <Check className="h-4 w-4" /> : i}
              </div>
            ))}
          </div>
          
          {stepContent()}
        </div>
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={step === 1 ? handleClose : () => setStep((prev) => prev - 1)}
          >
            {step === 1 ? 'Cancel' : (
              <>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </>
            )}
          </Button>
          
          {step < 5 ? (
            <Button
              type="button"
              disabled={!canProceed()}
              onClick={() => setStep((prev) => prev + 1)}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={createContractMutation.isPending || !canProceed()}
              onClick={() => createContractMutation.mutate()}
            >
              {createContractMutation.isPending ? 'Creating...' : 'Create Contract'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
