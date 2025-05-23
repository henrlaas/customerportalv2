
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createContract, fetchContractTemplate, replacePlaceholders, ContractWithDetails } from '@/utils/contractUtils';
import { CenteredSpinner } from '@/components/ui/CenteredSpinner';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Schema for the project contract form
const projectContractFormSchema = z.object({
  title: z.string().min(1, { message: 'Contract title is required' }),
  template_id: z.string().min(1, { message: 'Contract template is required' }),
  contact_id: z.string().min(1, { message: 'Contact is required' }),
});

type ProjectContractFormValues = z.infer<typeof projectContractFormSchema>;

interface CreateProjectContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  companyId: string;
  projectName: string;
}

export function CreateProjectContractDialog({ 
  isOpen, 
  onClose, 
  projectId, 
  companyId,
  projectName 
}: CreateProjectContractDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTemplateContent, setSelectedTemplateContent] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  
  const form = useForm<ProjectContractFormValues>({
    resolver: zodResolver(projectContractFormSchema),
    defaultValues: {
      title: `${projectName} - Contract`,
      template_id: '',
      contact_id: '',
    },
  });

  // Fetch contract templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['contract-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .or('type.eq.project,type.eq.Project') // Look for both 'project' and 'Project' types (case-insensitive)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch company contacts
  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ['company-contacts', companyId],
    queryFn: async () => {
      try {
        // Get contacts for this company
        const { data: contactsData, error: contactsError } = await supabase
          .from('company_contacts')
          .select(`
            id, 
            position,
            user_id
          `)
          .eq('company_id', companyId);
        
        if (contactsError) throw contactsError;
        
        // Get user profiles for these contacts
        const userIds = contactsData.map(contact => contact.user_id);
        
        // Use the profiles table to get names
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        
        // Map profiles to contacts
        const enrichedContacts = contactsData.map(contact => {
          const profile = profilesData.find(p => p.id === contact.user_id);
          return {
            ...contact,
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || ''
          };
        });
        
        return enrichedContacts;
      } catch (error) {
        console.error('Error fetching company contacts:', error);
        throw error;
      }
    },
    enabled: !!companyId,
  });

  // Handle template selection change
  const handleTemplateChange = async (templateId: string) => {
    if (!templateId) {
      setSelectedTemplateContent('');
      setPreviewContent('');
      return;
    }
    
    try {
      const template = await fetchContractTemplate(templateId);
      setSelectedTemplateContent(template.content);
      
      // Get company info for placeholders
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
        
      // Get project info
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      // Get selected contact info
      const contactId = form.getValues('contact_id');
      const selectedContact = contacts.find(c => c.id === contactId);
      
      // Create data object for placeholders
      const placeholderData = {
        company,
        contact: selectedContact,
        project
      };
      
      // Replace placeholders
      const processedContent = replacePlaceholders(template.content, placeholderData);
      setPreviewContent(processedContent);
    } catch (error) {
      console.error('Error fetching template:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contract template',
        variant: 'destructive',
      });
    }
  };
  
  // Handle contact selection change
  const handleContactChange = async (contactId: string) => {
    if (selectedTemplateContent && contactId) {
      // Get company info for placeholders
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
        
      // Get project info
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      // Get selected contact info
      const selectedContact = contacts.find(c => c.id === contactId);
      
      // Create data object for placeholders
      const placeholderData = {
        company,
        contact: selectedContact,
        project
      };
      
      // Replace placeholders
      const processedContent = replacePlaceholders(selectedTemplateContent, placeholderData);
      setPreviewContent(processedContent);
    }
  };

  // Watch for changes in template_id and contact_id
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'template_id') {
        handleTemplateChange(value.template_id as string);
      } else if (name === 'contact_id') {
        handleContactChange(value.contact_id as string);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch, contacts]);

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (values: ProjectContractFormValues) => {
      if (!user) throw new Error("You must be logged in to create a contract");
      
      // First get the template
      const template = await fetchContractTemplate(values.template_id);
      
      // Get company info for placeholders
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
        
      // Get project info
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      // Get selected contact info
      const selectedContact = contacts.find(c => c.id === values.contact_id);
      
      // Create data object for placeholders
      const placeholderData = {
        company,
        contact: selectedContact,
        project
      };
      
      // Replace placeholders in template
      const processedContent = replacePlaceholders(template.content, placeholderData);
      
      // Create the contract
      const contractData = await createContract({
        company_id: companyId,
        contact_id: values.contact_id,
        project_id: projectId,
        template_type: template.type, // Keep original case
        content: processedContent,
        title: values.title,
        created_by: user.id
      });
      
      return contractData;
    },
    onSuccess: () => {
      toast({
        title: 'Contract created',
        description: 'The project contract has been created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['project-contracts', projectId] });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create contract: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Submit handler
  const onSubmit = (values: ProjectContractFormValues) => {
    createContractMutation.mutate(values);
  };

  if (isLoadingTemplates || isLoadingContacts) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Project Contract</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center py-8">
            <CenteredSpinner />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Project Contract</DialogTitle>
          <DialogDescription>
            Generate a contract for project: {projectName}
          </DialogDescription>
        </DialogHeader>
        
        {templates.length === 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Templates Available</AlertTitle>
            <AlertDescription>
              No project contract templates found. Please create a template with type 'project' or 'Project' first.
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contract title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="template_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Template</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
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
            
            <FormField
              control={form.control}
              name="contact_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Contact</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a contact" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {`${contact.first_name} ${contact.last_name}`} {contact.position ? `- ${contact.position}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {previewContent && (
              <FormItem>
                <FormLabel>Contract Preview</FormLabel>
                <div className="border rounded-md p-4 bg-gray-50 min-h-[200px] max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                  {previewContent}
                </div>
                <FormDescription>
                  This is a preview of how your contract will look
                </FormDescription>
              </FormItem>
            )}
            
            <DialogFooter className="pt-6">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createContractMutation.isPending || templates.length === 0}
              >
                {createContractMutation.isPending ? 'Creating...' : 'Create Contract'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
