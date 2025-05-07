
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanyNames } from "@/hooks/useCompanyNames";

type CreateContractDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  onSuccess?: () => void;
};

type ContractFormData = {
  templateType: string;
  companyId: string;
  contactId: string;
};

export const CreateContractDialog = ({ 
  open, 
  onOpenChange,
  projectId,
  onSuccess 
}: CreateContractDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: companies, isLoading: isLoadingCompanies } = useCompanyNames();
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [step, setStep] = useState(1);
  
  const form = useForm<ContractFormData>({
    defaultValues: {
      templateType: '',
      companyId: '',
      contactId: '',
    }
  });

  const templates = [
    { id: 'dpa', name: 'DPA (Data Processing Agreement)' },
    { id: 'nda', name: 'NDA (Non-Disclosure Agreement)' },
    { id: 'web', name: 'Web Development' },
    { id: 'marketing', name: 'Marketing' },
  ];

  const onSubmit = async (data: ContractFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create contracts",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create contract in database
      const { error } = await supabase
        .from('contracts')
        .insert({
          template_type: data.templateType,
          company_id: data.companyId,
          contact_id: data.contactId,
          project_id: projectId,
          status: 'unsigned',
          created_by: user.id,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Contract created",
        description: "The contract has been successfully created and sent",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating contract:", error);
      toast({
        title: "Error creating contract",
        description: "Failed to create the contract. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCompanyChange = async (companyId: string) => {
    setIsLoadingContacts(true);
    form.setValue('companyId', companyId);
    form.setValue('contactId', '');
    
    try {
      // Fetch company contacts
      const { data, error } = await supabase
        .from('company_contacts')
        .select('id, user_id, position')
        .eq('company_id', companyId);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Fetch user details for each contact
        const userIds = data.map(contact => contact.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        
        // Combine contact data with user profiles
        const contactsWithProfiles = data.map(contact => {
          const profile = profiles?.find(p => p.id === contact.user_id);
          return {
            id: contact.id,
            userId: contact.user_id,
            position: contact.position,
            firstName: profile?.first_name || '',
            lastName: profile?.last_name || '',
            fullName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
          };
        });
        
        setContacts(contactsWithProfiles);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load company contacts",
        variant: "destructive",
      });
      setContacts([]);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !form.getValues('templateType')) {
      form.setError('templateType', { 
        type: 'required', 
        message: 'Please select a contract template' 
      });
      return;
    }
    
    if (step === 2 && !form.getValues('companyId')) {
      form.setError('companyId', { 
        type: 'required', 
        message: 'Please select a company' 
      });
      return;
    }
    
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Contract</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <FormField
                control={form.control}
                name="templateType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Template</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contract template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {step === 2 && (
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Company</FormLabel>
                    <Select 
                      onValueChange={(value) => handleCompanyChange(value)} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingCompanies ? (
                          <SelectItem value="loading" disabled>Loading companies...</SelectItem>
                        ) : (
                          companies?.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {step === 3 && (
              <FormField
                control={form.control}
                name="contactId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Contact</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingContacts ? (
                          <SelectItem value="loading" disabled>Loading contacts...</SelectItem>
                        ) : contacts.length > 0 ? (
                          contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.fullName} {contact.position && `(${contact.position})`}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No contacts found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep} className="mr-2">
                  Previous
                </Button>
              )}
              
              {step < 3 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit">
                  Create Contract
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
