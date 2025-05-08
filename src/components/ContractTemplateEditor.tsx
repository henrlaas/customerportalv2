
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Save, Edit, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ContractTemplate,
  fetchContractTemplates,
  updateContractTemplate,
  createContractTemplate
} from '@/utils/contractUtils';

export const ContractTemplateEditor = () => {
  const [selectedTab, setSelectedTab] = useState('DPA');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    type: '',
    content: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch contract templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['contractTemplates'],
    queryFn: () => fetchContractTemplates(),
  });
  
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
  
  // Handle create new template
  const handleCreateTemplate = () => {
    createTemplateMutation.mutate({
      name: editForm.name,
      type: editForm.type,
      content: editForm.content
    });
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
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input 
                    value={editForm.name} 
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Template name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Tabs 
                    value={editForm.type || 'DPA'} 
                    onValueChange={value => setEditForm(prev => ({ ...prev, type: value }))}
                  >
                    <TabsList>
                      <TabsTrigger value="DPA">DPA</TabsTrigger>
                      <TabsTrigger value="NDA">NDA</TabsTrigger>
                      <TabsTrigger value="Web">Web</TabsTrigger>
                      <TabsTrigger value="Marketing">Marketing</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
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
                disabled={!editForm.name || !editForm.type || !editForm.content || createTemplateMutation.isPending}
              >
                {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="bg-background rounded-lg border shadow-sm">
        <Tabs defaultValue="DPA" value={selectedTab} onValueChange={setSelectedTab}>
          <div className="border-b px-4">
            <TabsList>
              <TabsTrigger value="DPA">DPA</TabsTrigger>
              <TabsTrigger value="NDA">NDA</TabsTrigger>
              <TabsTrigger value="Web">Web</TabsTrigger>
              <TabsTrigger value="Marketing">Marketing</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-4">
            <PlaceholdersHelp />
            
            <TabsContent value={selectedTab} className="pt-2">
              <div className="grid grid-cols-1 gap-4">
                {filteredTemplates.map(template => (
                  <Card key={template.id}>
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
                    <CardFooter className="flex justify-end">
                      <Button 
                        variant="outline"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Template
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
              </div>
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
                  <TabsList>
                    <TabsTrigger value="DPA">DPA</TabsTrigger>
                    <TabsTrigger value="NDA">NDA</TabsTrigger>
                    <TabsTrigger value="Web">Web</TabsTrigger>
                    <TabsTrigger value="Marketing">Marketing</TabsTrigger>
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
    </div>
  );
};

