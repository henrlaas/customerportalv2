
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Deal, Company, TempDealContact } from '../types/deal';
import { Building, Mail, Phone, Globe, MapPin, Copy, User } from 'lucide-react';
import { getCompanyName } from '../utils/formatters';
import { useToast } from '@/hooks/use-toast';

interface CompanyContactSectionProps {
  deal: Deal;
  companies: Company[];
  tempCompanies: any[];
  tempContacts: TempDealContact[];
}

export const CompanyContactSection: React.FC<CompanyContactSectionProps> = ({
  deal,
  companies,
  tempCompanies,
  tempContacts,
}) => {
  const { toast } = useToast();
  
  // Find temporary company for this deal
  const tempCompany = tempCompanies.find(tc => tc.deal_id === deal.id);
  const tempContact = tempContacts.find(tc => tc.deal_id === deal.id);
  const isTemporary = !!tempCompany;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Company & Contact
          {isTemporary && <Badge variant="secondary">New Company</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Company Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              {isTemporary ? tempCompany.company_name : getCompanyName(deal.company_id, companies, tempCompanies, deal.id)}
            </h4>
          </div>
          
          {isTemporary && tempCompany && (
            <div className="space-y-2 text-sm">
              {tempCompany.organization_number && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Org. Number:</span>
                  <div className="flex items-center gap-2">
                    <span>{tempCompany.organization_number}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
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
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" />
                      {tempCompany.website}
                    </a>
                  </div>
                </div>
              )}
              
              {(tempCompany.street_address || tempCompany.city || tempCompany.postal_code || tempCompany.country) && (
                <div className="flex items-start justify-between">
                  <span className="text-gray-600">Address:</span>
                  <div className="text-right">
                    {tempCompany.street_address && <div>{tempCompany.street_address}</div>}
                    <div>
                      {tempCompany.postal_code && `${tempCompany.postal_code} `}
                      {tempCompany.city}
                    </div>
                    {tempCompany.country && <div>{tempCompany.country}</div>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contact Information */}
        {tempContact && (
          <div className="border-t pt-4">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <User className="h-4 w-4" />
              Contact Person
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">
                  {tempContact.first_name} {tempContact.last_name}
                </span>
              </div>
              
              {tempContact.position && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Position:</span>
                  <span>{tempContact.position}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email:</span>
                <div className="flex items-center gap-2">
                  <a 
                    href={`mailto:${tempContact.email}`}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    {tempContact.email}
                  </a>
                  <Button 
                    variant="ghost" 
                    size="sm"
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
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      {tempContact.phone}
                    </a>
                    <Button 
                      variant="ghost" 
                      size="sm"
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
