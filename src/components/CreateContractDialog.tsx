import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { PlusCircle, ArrowLeft, ArrowRight, Check, RefreshCw, AlertTriangle } from 'lucide-react';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Select from 'react-select';

interface CreateContractDialogProps {
  onContractCreated?: () => void;
}

// Define the contact interface with properly typed profiles
interface CompanyContact {
  id: string;
  company_id: string;
  user_id: string;
  position: string | null;
  is_primary: boolean;
  profiles?: {
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  email?: string; // Add this to the type
}

// Interface for email data returned from edge function
interface EmailData {
  id: string;
  email: string;
}

export function CreateContractDialog({ onContractCreated }: CreateContractDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showSubsidiaries, setShowSubsidiaries] = useState(false);
  const [contactsFetchError, setContactsFetchError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Fetch contract templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['contractTemplates'],
    queryFn: () => fetchContractTemplates(),
  });
  
  // Fetch companies with subsidiaries option
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies', showSubsidiaries],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select('*, parent:parent_id(id, name)')
        .order('name');
      
      // Only filter by parent_id when not showing subsidiaries
      if (!showSubsidiaries) {
        query = query.is('parent_id', null);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
  
  // Get parent company ID (either the selected company or its parent)
  const getParentCompanyId = () => {
    if (!selectedCompany) return null;
    
    // If the selected company has a parent, use the parent's ID
    if (selectedCompany.parent_id) {
      return selectedCompany.parent_id;
    }
    
    // Otherwise, use the selected company's ID
    return selectedCompany.id;
  };
  
  // Fetch contacts when company is selected
  const { data: contacts = [], isLoading: isLoadingContacts, refetch: refetchContacts, error: contactsError } = useQuery<CompanyContact[]>({
    queryKey: ['companyContacts', selectedCompany?.id],
    queryFn: async () => {
      if (!selectedCompany?.id) return [];
      
      console.log('Fetching contacts for company:', selectedCompany.id);
      
      // Get contacts for the selected company
      const { data, error } = await supabase
        .from('company_contacts')
        .select(`
          id, 
          company_id,
          user_id,
          position,
          is_primary,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .eq('company_id', selectedCompany.id);
      
      if (error) throw error;
      console.info('Contacts query status:', {
        isLoading: false,
        isError: !!error,
        contactCount: data?.length
      });
      
      // Create a new array with the correct type
      const contactsWithEmail: CompanyContact[] = (data || []).map(contact => ({
        id: contact.id,
        company_id: contact.company_id,
        user_id: contact.user_id,
        position: contact.position,
        is_primary: contact.is_primary,
        profiles: contact.profiles as unknown as { first_name?: string | null, last_name?: string | null } | null,
        email: undefined // We'll fill this in later
      }));
      
      if (contactsWithEmail && contactsWithEmail.length > 0) {
        try {
          const userIds = contactsWithEmail.map(contact => contact.user_id).filter(Boolean);
          
          // Call edge function to get emails
          const { data: emailsData, error: emailError } = await supabase.functions.invoke('user-management', {
            body: {
              action: 'list',
              userIds: userIds
            }
          });
          
          if (emailError) {
            console.warn('Could not fetch email addresses:', emailError);
            // Continue without emails
          } else if (emailsData) {
            // Map emails to contacts
            const emailMap = new Map<string, string>();
            
            // Safely cast and process email data
            if (Array.isArray(emailsData)) {
              emailsData.forEach((item: any) => {
                if (item && typeof item.id === 'string' && typeof item.email === 'string') {
                  emailMap.set(item.id, item.email);
                }
              });
              
              contactsWithEmail.forEach(contact => {
                if (contact.user_id) {
                  // Add email property to contact objects
                  const email = emailMap.get(contact.user_id);
                  if (email) {
                    contact.email = email;
                  }
                }
              });
            }
          }
        } catch (err) {
          console.warn('Error fetching user emails:', err);
          // Continue without emails
        }
      }
      
      return contactsWithEmail;
    },
    enabled: !!selectedCompany?.id,
    retry: 2,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching contacts:', error);
        setContactsFetchError(error.message);
      }
    }
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
    setContactsFetchError(null);
  };
  
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  // Clear contact when company changes
  useEffect(() => {
    setSelectedContact(null);
    setContactsFetchError(null);
  }, [selectedCompany]);

  // Format templates for react-select
  const formatTemplatesForSelect = (templates: ContractTemplate[]) => {
    return templates.map(template => ({
      value: template.id,
      label: template.name,
      template
    }));
  };

  // Format companies for react-select
  const formatCompaniesForSelect = (companies: any[]) => {
    return companies.map(company => ({
      value: company.id,
      label: company.name,
      isSubsidiary: !!company.parent_id,
      ...company
    }));
  };

  // Format contacts for react-select
  const formatContactsForSelect = (contacts: CompanyContact[]) => {
    return contacts.map(contact => {
      const firstName = contact.profiles?.first_name || '';
      const lastName = contact.profiles?.last_name || '';
      const email = contact.email || ''; // Using email property we add in the query function
      const label = `${firstName} ${lastName}${email ? ` (${email})` : ''}`;
      
      return {
        value: contact.id,
        label,
        ...contact
      };
    });
  };

  // Format projects for react-select
  const formatProjectsForSelect = (projects: any[]) => {
    return projects.map(project => ({
      value: project.id,
      label: project.name,
      ...project
    }));
  };
  
  const stepContent = () => {
    switch (step) {
      case 1: // Template selection
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Choose a contract template to use.</p>
            
            <Tabs defaultValue="DPA">
              <TabsList className="mb-4">
                <TabsTrigger value="DPA">DPA</TabsTrigger>
                <TabsTrigger value="NDA">NDA</TabsTrigger>
                <TabsTrigger value="Web">Web</TabsTrigger>
                <TabsTrigger value="Marketing">Marketing</TabsTrigger>
              </TabsList>
              
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
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-subsidiaries"
                  checked={showSubsidiaries} 
                  onCheckedChange={setShowSubsidiaries} 
                />
                <Label htmlFor="show-subsidiaries">Show subsidiaries</Label>
              </div>
              
              <div className="mt-2">
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={formatCompaniesForSelect(companies)}
                  value={selectedCompany ? {
                    value: selectedCompany.id,
                    label: selectedCompany.name,
                    isSubsidiary: !!selectedCompany.parent_id,
                  } : null}
                  onChange={(option: any) => {
                    setSelectedCompany(option);
                    setSelectedContact(null); // Reset contact when company changes
                  }}
                  isLoading={isLoadingCompanies}
                  isClearable
                  placeholder="Select a company..."
                  formatOptionLabel={({ label, isSubsidiary }) => (
                    <div>
                      {isSubsidiary && <span className="text-muted-foreground">↳ </span>}
                      {label}
                    </div>
                  )}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: 'var(--radius)',
                      borderColor: 'hsl(var(--input))',
                      backgroundColor: 'hsl(var(--background))',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: 'hsl(var(--input))'
                      },
                      padding: '1px',
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: 'hsl(var(--background))',
                      borderRadius: 'var(--radius)',
                      zIndex: 50,
                    }),
                    option: (base, { isFocused, isSelected }) => ({
                      ...base,
                      backgroundColor: isSelected 
                        ? 'hsl(var(--primary) / 0.2)'
                        : isFocused 
                          ? 'hsl(var(--accent))'
                          : undefined,
                      color: 'hsl(var(--foreground))'
                    }),
                  }}
                />
              </div>
            </div>
          </div>
        );
      
      case 3: // Contact selection
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a contact from {selectedCompany?.name} who will receive and sign the contract.
            </p>
            
            {isLoadingContacts ? (
              <div className="flex items-center justify-center space-x-2 py-4">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading contacts...</span>
              </div>
            ) : contactsFetchError ? (
              <div className="text-center py-4 space-y-2">
                <p className="text-red-500">Error loading contacts: {contactsFetchError}</p>
                <Button variant="outline" size="sm" onClick={() => {
                  setContactsFetchError(null);
                  refetchContacts();
                }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-4 space-y-2">
                <p>No contacts found for this company.</p>
                <Button variant="outline" size="sm" onClick={() => {
                  refetchContacts();
                }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            ) : (
              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                options={formatContactsForSelect(contacts)}
                value={selectedContact ? {
                  value: selectedContact.id,
                  label: `${selectedContact.profiles?.first_name || ''} ${selectedContact.profiles?.last_name || ''}${selectedContact.email ? ` (${selectedContact.email})` : ''}`,
                } : null}
                onChange={(option: any) => setSelectedContact(option)}
                isLoading={isLoadingContacts}
                isClearable
                placeholder="Select a contact..."
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: 'var(--radius)',
                    borderColor: 'hsl(var(--input))',
                    backgroundColor: 'hsl(var(--background))',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: 'hsl(var(--input))'
                    },
                    padding: '1px',
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: 'hsl(var(--background))',
                    borderRadius: 'var(--radius)',
                    zIndex: 50,
                  }),
                  option: (base, { isFocused, isSelected }) => ({
                    ...base,
                    backgroundColor: isSelected 
                      ? 'hsl(var(--primary) / 0.2)'
                      : isFocused 
                        ? 'hsl(var(--accent))'
                        : undefined,
                    color: 'hsl(var(--foreground))'
                  }),
                }}
              />
            )}
          </div>
        );
      
      case 4: // Project selection (optional)
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Optionally, you can associate this contract with a project.
            </p>
            
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={[
                { value: '', label: 'None' },
                ...formatProjectsForSelect(projects)
              ]}
              value={selectedProject ? {
                value: selectedProject.id,
                label: selectedProject.name,
              } : { value: '', label: 'None' }}
              onChange={(option: any) => {
                if (option.value === '') {
                  setSelectedProject(null);
                } else {
                  setSelectedProject(option);
                }
              }}
              isLoading={isLoadingProjects}
              placeholder="Select a project (optional)..."
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: 'var(--radius)',
                  borderColor: 'hsl(var(--input))',
                  backgroundColor: 'hsl(var(--background))',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: 'hsl(var(--input))'
                  },
                  padding: '1px',
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: 'hsl(var(--background))',
                  borderRadius: 'var(--radius)',
                  zIndex: 50,
                }),
                option: (base, { isFocused, isSelected }) => ({
                  ...base,
                  backgroundColor: isSelected 
                    ? 'hsl(var(--primary) / 0.2)'
                    : isFocused 
                      ? 'hsl(var(--accent))'
                      : undefined,
                  color: 'hsl(var(--foreground))'
                }),
              }}
            />
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
                    {selectedContact?.profiles?.first_name || ''} {selectedContact?.profiles?.last_name || ''}
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

          {/* Step content */}
          {stepContent()}
        </div>
        
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => (step > 1 ? setStep(step - 1) : handleClose())}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          <Button
            type="button"
            onClick={() => {
              if (step < 5) {
                setStep(step + 1);
              } else {
                createContractMutation.mutate();
              }
            }}
            disabled={!canProceed() || createContractMutation.isPending}
          >
            {step < 5
              ? 'Next'
              : createContractMutation.isPending
              ? 'Creating...'
              : 'Create Contract'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
