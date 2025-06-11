
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, FileText, User, Building } from 'lucide-react';
import { replacePlaceholders } from '@/utils/contractUtils';

interface ProjectContractConfirmationStageProps {
  form: UseFormReturn<any>;
  selectedContact: any;
  projectTemplate: any;
  companyData: any;
  projectData: any;
  isLoadingTemplate: boolean;
}

export function ProjectContractConfirmationStage({ 
  form, 
  selectedContact, 
  projectTemplate, 
  companyData, 
  projectData, 
  isLoadingTemplate 
}: ProjectContractConfirmationStageProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const title = form.watch('title');
  
  // Prepare data for placeholder replacement
  const placeholderData = {
    company: companyData,
    contact: {
      first_name: selectedContact?.profiles?.first_name,
      last_name: selectedContact?.profiles?.last_name,
      position: selectedContact?.position,
    },
    project: projectData,
  };
  
  const processedContent = projectTemplate?.content 
    ? replacePlaceholders(projectTemplate.content, placeholderData)
    : '';

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Contract Title</label>
            <p className="mt-1 font-medium">{title}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Company</label>
            <div className="mt-1 flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{companyData?.name}</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Signing Contact</label>
            <div className="mt-1 flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedContact?.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {selectedContact?.profiles?.first_name?.[0] || ''}
                  {selectedContact?.profiles?.last_name?.[0] || ''}
                  {!selectedContact?.profiles?.first_name && !selectedContact?.profiles?.last_name && (
                    <User className="h-3 w-3" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {selectedContact?.profiles?.first_name || ''} {selectedContact?.profiles?.last_name || ''}
                </div>
                {selectedContact?.position && (
                  <div className="text-sm text-muted-foreground">
                    {selectedContact.position}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Project</label>
            <p className="mt-1 font-medium">{projectData?.name}</p>
          </div>
        </CardContent>
      </Card>

      {/* Contract Preview */}
      <Card>
        <Collapsible open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contract Preview
                </span>
                <Button variant="ghost" size="sm">
                  {isPreviewOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {isLoadingTemplate ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading contract template...
                </div>
              ) : projectTemplate ? (
                <div className="bg-muted/30 rounded-md p-4 max-h-96 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {processedContent}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No template found
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
