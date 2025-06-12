
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContractTitleContactStageProps {
  title: string;
  contactId: string;
  templateId: string;
  contacts: any[];
  templates: any[];
  onTitleChange: (title: string) => void;
  onContactChange: (contactId: string) => void;
  onTemplateChange: (templateId: string) => void;
}

export const ContractTitleContactStage: React.FC<ContractTitleContactStageProps> = ({
  title,
  contactId,
  templateId,
  contacts,
  templates,
  onTitleChange,
  onContactChange,
  onTemplateChange
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="contract-title">Contract Title</Label>
        <Input
          id="contract-title"
          placeholder="Project Agreement - Company Name"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <Label>Select Company Contact</Label>
        {contacts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No contacts found for this company
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {contacts.map((contact) => (
              <Card
                key={contact.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  contactId === contact.id
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-muted-foreground"
                )}
                onClick={() => onContactChange(contact.id)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contact.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {contact.profiles?.first_name?.[0] || ''}
                      {contact.profiles?.last_name?.[0] || ''}
                      {!contact.profiles?.first_name && !contact.profiles?.last_name && (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">
                      {contact.profiles?.first_name || ''} {contact.profiles?.last_name || ''}
                    </div>
                    {contact.position && (
                      <div className="text-sm text-muted-foreground">
                        {contact.position}
                      </div>
                    )}
                  </div>
                  {contactId === contact.id && (
                    <div className="text-primary">
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label>Select Contract Template</Label>
        {templates.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No templates available
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  templateId === template.id
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-muted-foreground"
                )}
                onClick={() => onTemplateChange(template.id)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {template.type}
                    </div>
                  </div>
                  {templateId === template.id && (
                    <div className="text-primary">
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
