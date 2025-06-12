
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, FileText, User } from 'lucide-react';

interface ProjectContractConfirmationStageProps {
  formData: {
    title: string;
    contactId: string;
    templateId: string;
  };
  contacts: any[];
  templates: any[];
  projectName: string;
  companyId: string;
}

export const ProjectContractConfirmationStage: React.FC<ProjectContractConfirmationStageProps> = ({
  formData,
  contacts,
  templates,
  projectName,
  companyId
}) => {
  const selectedContact = contacts.find(c => c.id === formData.contactId);
  const selectedTemplate = templates.find(t => t.id === formData.templateId);

  return (
    <div className="space-y-6">
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
            <p className="mt-1 font-medium">{formData.title}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Project</label>
            <div className="mt-1 flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{projectName}</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Contact</label>
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
            <label className="text-sm font-medium text-muted-foreground">Template</label>
            <p className="mt-1 font-medium">{selectedTemplate?.name || 'No template selected'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
