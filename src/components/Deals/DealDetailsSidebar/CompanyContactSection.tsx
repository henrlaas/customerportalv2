
import React from 'react';
import { Building, Copy, ExternalLink, Mail, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Deal, Company } from '../types/deal';
import { getCompanyName } from '../utils/formatters';
import { useToast } from '@/hooks/use-toast';

interface CompanyContactSectionProps {
  deal: Deal;
  companies: Company[];
  tempCompany: any;
  tempContact: any;
}

export const CompanyContactSection = ({
  deal,
  companies,
  tempCompany,
  tempContact,
}: CompanyContactSectionProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to clipboard',
        description: `${label} copied successfully`,
      });
    });
  };

  const isExistingCompany = !!deal.company_id;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building className="h-5 w-5" />
          Company & Contact
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Company Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">
              {isExistingCompany 
                ? getCompanyName(deal.company_id, companies, null, deal.id)
                : tempCompany?.company_name || 'Unknown Company'
              }
            </h4>
            {!isExistingCompany && (
              <Badge variant="outline" className="text-xs">
                New Company
              </Badge>
            )}
          </div>

          {/* Temp Company Details */}
          {tempCompany && (
            <div className="space-y-2 text-sm">
              {tempCompany.organization_number && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Org. Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{tempCompany.organization_number}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(tempCompany.organization_number, 'Organization number')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              {tempCompany.website && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Website:</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={tempCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span className="truncate max-w-32">{tempCompany.website}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
              
              {/* Address */}
              {(tempCompany.street_address || tempCompany.city) && (
                <div className="space-y-1">
                  <span className="text-gray-600 text-sm">Address:</span>
                  <div className="text-sm text-gray-900">
                    {tempCompany.street_address && (
                      <div>{tempCompany.street_address}</div>
                    )}
                    <div>
                      {tempCompany.postal_code} {tempCompany.city}
                      {tempCompany.country && `, ${tempCompany.country}`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contact Information */}
        {tempContact && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact Person
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">
                  {tempContact.first_name} {tempContact.last_name}
                  {tempContact.position && (
                    <span className="text-gray-500 font-normal"> • {tempContact.position}</span>
                  )}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email:</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${tempContact.email}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    <span>{tempContact.email}</span>
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(tempContact.email, 'Email')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {tempContact.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${tempContact.phone}`}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      <span>{tempContact.phone}</span>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(tempContact.phone, 'Phone number')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
