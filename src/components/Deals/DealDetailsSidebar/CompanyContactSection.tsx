
import React from 'react';
import { Building, Copy, ExternalLink, Mail, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Deal, Company } from '../types/deal';
import { getCompanyName } from '../utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { CompanyFavicon } from '@/components/CompanyFavicon';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  tempContact
}: CompanyContactSectionProps) => {
  const { toast } = useToast();

  // Fetch existing company details if deal has company_id
  const { data: existingCompany } = useQuery({
    queryKey: ['company-details', deal.company_id],
    queryFn: async () => {
      if (!deal.company_id) return null;
      
      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('id', deal.company_id)
        .single();
        
      return data;
    },
    enabled: !!deal.company_id
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to clipboard',
        description: `${label} copied successfully`
      });
    });
  };

  const isExistingCompany = !!deal.company_id;
  const displayCompany = isExistingCompany ? existingCompany : tempCompany;
  const companyName = isExistingCompany 
    ? getCompanyName(deal.company_id, companies, null, deal.id) 
    : tempCompany?.company_name || 'Unknown Company';

  const formatAddress = (company: any) => {
    if (!company) return null;
    
    const parts = [];
    if (company.street_address) parts.push(company.street_address);
    
    const cityPart = [];
    if (company.postal_code) cityPart.push(company.postal_code);
    if (company.city) cityPart.push(company.city);
    if (cityPart.length > 0) parts.push(cityPart.join(' '));
    
    if (company.country) parts.push(company.country);
    
    return parts.length > 0 ? parts.join(', ') : null;
  };

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
          <div className="flex items-center gap-3">
            <CompanyFavicon 
              companyName={companyName}
              website={displayCompany?.website}
              logoUrl={existingCompany?.logo_url}
              size="md"
            />
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">{companyName}</h4>
              {!isExistingCompany && (
                <Badge variant="outline" className="text-xs">Temporary</Badge>
              )}
            </div>
          </div>

          {/* Company Details */}
          {displayCompany && (
            <div className="space-y-2 text-sm">
              {displayCompany.organization_number && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Org. Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{displayCompany.organization_number}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0" 
                      onClick={() => copyToClipboard(displayCompany.organization_number, 'Organization number')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              {displayCompany.website && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Website:</span>
                  <div className="flex items-center gap-2">
                    <a 
                      href={displayCompany.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span className="truncate max-w-32">{displayCompany.website}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
              
              {/* Address - Display horizontally */}
              {formatAddress(displayCompany) && (
                <div className="space-y-1">
                  <span className="text-gray-600 text-sm">Address:</span>
                  <div className="text-sm text-gray-900">
                    {formatAddress(displayCompany)}
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
