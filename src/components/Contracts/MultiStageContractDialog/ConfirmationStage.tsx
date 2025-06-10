
import React, { useState } from 'react';
import { FormData } from './types';
import { CompanyFavicon } from '@/components/CompanyFavicon';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { replacePlaceholders } from '@/utils/contractUtils';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';

interface ConfirmationStageProps {
  formData: FormData;
}

export function ConfirmationStage({ formData }: ConfirmationStageProps) {
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const { company, contact, template } = formData;

  // Prepare data for placeholder replacement
  const placeholderData = {
    company: company ? {
      name: company.name,
      organization_number: company.organization_number,
      street_address: company.street_address,
      address: company.street_address,
      postal_code: company.postal_code,
      city: company.city,
      country: company.country,
      mrr: company.mrr
    } : null,
    contact: contact ? {
      first_name: contact.first_name,
      last_name: contact.last_name,
      position: contact.position
    } : null
  };

  const contractContent = template ? replacePlaceholders(template.content, placeholderData) : '';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Confirmation</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Review your selections before creating the contract
        </p>
      </div>

      {/* Selection Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Company Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Company</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {company ? (
              <div className="flex items-center gap-2">
                <CompanyFavicon 
                  companyName={company.name}
                  website={company.website}
                  logoUrl={company.logo_url}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{company.name}</p>
                  {company.organization_number && (
                    <p className="text-xs text-muted-foreground">{company.organization_number}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No company selected</p>
            )}
          </CardContent>
        </Card>

        {/* Contact Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Contact</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {contact ? (
              <div className="flex items-center gap-2">
                <UserAvatarGroup 
                  users={[{
                    id: contact.user_id,
                    first_name: contact.first_name || '',
                    last_name: contact.last_name || '',
                    avatar_url: contact.avatar_url
                  }]}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {`${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown'}
                  </p>
                  {contact.position && (
                    <p className="text-xs text-muted-foreground truncate">{contact.position}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No contact selected</p>
            )}
          </CardContent>
        </Card>

        {/* Template Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Template</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {template ? (
              <div>
                <p className="font-medium truncate">{template.name}</p>
                <Badge variant="outline" className="text-xs mt-1">{template.type}</Badge>
              </div>
            ) : (
              <p className="text-muted-foreground">No template selected</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Collapsible Contract Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Contract Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Preview the contract with placeholders replaced
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Collapsible open={isPreviewExpanded} onOpenChange={setIsPreviewExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {isPreviewExpanded ? 'Hide Contract Preview' : 'View Contract Preview'}
                </div>
                {isPreviewExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              {contractContent ? (
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {contractContent}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-muted-foreground">Complete all selections to see preview</p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
}
