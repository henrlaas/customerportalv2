
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Save, Edit, AlertTriangle, Trash, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ContractTemplate,
  fetchContractTemplates,
  updateContractTemplate,
  createContractTemplate,
  deleteContractTemplate
} from '@/utils/contractUtils';

export const ContractTemplateEditor = () => {
  const [selectedTab, setSelectedTab] = useState('DPA');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ContractTemplate | null>(null);
  const [isAddingContractType, setIsAddingContractType] = useState(false);
  const [newContractTypeName, setNewContractTypeName] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'DPA', // Default to the currently selected tab
    content: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch contract templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['contractTemplates'],
    queryFn: () => fetchContractTemplates(),
  });
  
  // Get all unique contract types from templates
  const contractTypes = Array.from(new Set(templates.map(template => template.type)));
  
  // Filter templates by type (based on selected tab)
  const filteredTemplates = templates.filter(template => template.type === selectedTab);
  
  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: (updates: { id: string; updates: Partial<ContractTemplate> }) => 
      updateContractTemplate(updates.id, updates.updates),
    onSuccess: () => {
      toast({
        title: 'Template updated',
        description: 'The contract template has been updated successfully.',
      });
      setIsEditing(false);
      setSelectedTemplate(null);
      queryClient.invalidateQueries({ queryKey: ['contractTemplates'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (template: Omit<ContractTemplate, 'id' | 'created_at' | 'updated_at'>) => 
      createContractTemplate(template),
    onSuccess: () => {
      toast({
        title: 'Template created',
        description: 'The new contract template has been created successfully.',
      });
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ['contractTemplates'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => deleteContractTemplate(id),
    onSuccess: () => {
      toast({
        title: 'Template deleted',
        description: 'The contract template has been deleted successfully.',
      });
      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['contractTemplates'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle template selection for editing
  const handleEditTemplate = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setEditForm({
      name: template.name,
      type: template.type,
      content: template.content
    });
    setIsEditing(true);
  };
  
  // Handle template update
  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;
    
    updateTemplateMutation.mutate({
      id: selectedTemplate.id,
      updates: {
        name: editForm.name,
        type: editForm.type,
        content: editForm.content
      }
    });
  };
  
  // Handle template deletion
  const handleDeleteTemplate = (template: ContractTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };

  // Confirm template deletion
  const confirmDeleteTemplate = () => {
    if (templateToDelete) {
      deleteTemplateMutation.mutate(templateToDelete.id);
    }
  };
  
  // Handle create new template
  const handleCreateTemplate = () => {
    createTemplateMutation.mutate({
      name: editForm.name,
      // Use the currently selected tab as the type instead of requiring users to select it
      type: selectedTab,
      content: editForm.content
    });
  };
  
  // Handle opening create dialog - reset form and set type to current tab
  const handleOpenCreateDialog = () => {
    setEditForm({
      name: '',
      type: selectedTab,
      content: ''
    });
    setIsCreating(true);
  };

  // When tab changes, update the form type for new templates
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    if (isCreating) {
      setEditForm(prev => ({ ...prev, type: value }));
    }
  };

  // Handle adding a new contract type
  const handleAddContractType = () => {
    if (!newContractTypeName.trim()) {
      toast({
        title: 'Error',
        description: 'Contract type name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    // Create a template with the new type to ensure the type exists
    createTemplateMutation.mutate({
      name: `${newContractTypeName} Template`,
      type: newContractTypeName.trim(),
      content: 'Your new contract template content goes here.'
    });

    setIsAddingContractType(false);
    setNewContractTypeName('');
    setSelectedTab(newContractTypeName.trim());
  };
  
  const PlaceholdersHelp = () => (
    <Alert className="bg-[#FEF7CD] border-yellow-300 mb-4">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-sm text-yellow-800">
        <span className="font-medium">Available placeholders:</span>{' '}
        <code>{'{{companyname}}'}</code>, <code>{'{{organizationnumber}}'}</code>, 
        <code>{'{{address}}'}</code>, <code>{'{{zipcode}}'}</code>, <code>{'{{city}}'}</code>, <code>{'{{country}}'}</code>, 
        <code>{'{{contactfullname}}'}</code>, <code>{'{{contactposition}}'}</code>, <code>{'{{todaydate}}'}</code>, <code>{'{{mrrprice}}'}</code>
      </AlertDescription>
    </Alert>
  );
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading templates...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Contract Templates</h2>
        
        <div className="flex space-x-2">
          <Popover open={isAddingContractType} onOpenChange={setIsAddingContractType}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Add Contract Type
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Add New Contract Type</h4>
                <div className="space-y-2">
                  <Input 
                    placeholder="Contract type name" 
                    value={newContractTypeName}
                    onChange={e => setNewContractTypeName(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleAddContractType}>
                    Add Type
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreateDialog}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Contract Template</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <PlaceholdersHelp />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input 
                    value={editForm.name} 
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Template name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Template Type: <span className="font-semibold">{selectedTab}</span></label>
                  <p className="text-sm text-muted-foreground">
                    New templates will be created with the currently selected tab type.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <Textarea 
                    value={editForm.content} 
                    onChange={e => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Contract content"
                    className="min-h-[400px] font-mono text-sm"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTemplate}
                  disabled={!editForm.name || !editForm.content || createTemplateMutation.isPending}
                >
                  {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="bg-background rounded-lg border shadow-sm">
        <Tabs defaultValue="DPA" value={selectedTab} onValueChange={handleTabChange}>
          <div className="border-b px-4 overflow-x-auto">
            <TabsList className="flex-wrap">
              {contractTypes.map((type) => (
                <TabsTrigger key={type} value={type}>{type}</TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <div className="p-4">
            <PlaceholdersHelp />
            
            <TabsContent value={selectedTab} className="mt-2 space-y-4">
              {filteredTemplates.map(template => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>
                      {format(new Date(template.updated_at), "Last updated: MMM d, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 overflow-y-auto whitespace-pre-wrap border rounded-md p-3 bg-muted/50 text-sm">
                      {template.content}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Template
                    </Button>
                    <Button 
                      variant="outline"
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      onClick={() => handleDeleteTemplate(template)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              {filteredTemplates.length === 0 && (
                <Card>
                  <CardContent className="flex justify-center items-center h-32">
                    <p className="text-muted-foreground">No templates found for {selectedTab}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Edit dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contract Template</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <PlaceholdersHelp />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  value={editForm.name} 
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Tabs 
                  value={editForm.type} 
                  onValueChange={value => setEditForm(prev => ({ ...prev, type: value }))}
                >
                  <TabsList className="flex-wrap">
                    {contractTypes.map((type) => (
                      <TabsTrigger key={type} value={type}>{type}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea 
                value={editForm.content} 
                onChange={e => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[400px] font-mono text-sm"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTemplate}
              disabled={updateTemplateMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {updateTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the template "{templateToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteTemplateMutation.isPending}
            >
              {deleteTemplateMutation.isPending ? "Deleting..." : "Delete Template"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
