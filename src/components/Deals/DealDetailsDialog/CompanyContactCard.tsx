import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, Globe, MapPin, Phone, Mail, User, Copy } from 'lucide-react';
import { Company } from '../types/deal';
import { getCompanyName } from '../utils/formatters';
import { useToast } from '@/hooks/use-toast';
interface CompanyContactCardProps {
  companyId: string | null;
  dealId: string;
  companies: Company[];
  tempCompanies: any;
}
export const CompanyContactCard: React.FC<CompanyContactCardProps> = ({
  companyId,
  dealId,
  companies,
  tempCompanies
}) => {
  const {
    toast
  } = useToast();

  // Fetch temp company data if no companyId
  const {
    data: tempCompany
  } = useQuery({
    queryKey: ['temp-deal-company', dealId],
    queryFn: async () => {
      if (companyId) return null;
      const {
        data,
        error
      } = await supabase.from('temp_deal_companies').select('*').eq('deal_id', dealId).single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching temp company:', error);
        return null;
      }
      return data;
    },
    enabled: !companyId
  });

  // Fetch temp contact data if no companyId
  const {
    data: tempContact
  } = useQuery({
    queryKey: ['temp-deal-contact', dealId],
    queryFn: async () => {
      if (companyId) return null;
      const {
        data,
        error
      } = await supabase.from('temp_deal_contacts').select('*').eq('deal_id', dealId).single();
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching temp contact:', error);
        return null;
      }
      return data;
    },
    enabled: !companyId
  });
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${label} copied successfully`
    });
  };
  const existingCompany = companyId ? companies.find(c => c.id === companyId) : null;
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Company & Contact Information
          {tempCompany && <Badge variant="secondary">Temporary</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {existingCompany ? <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{existingCompany.name}</span>
            </div>
            {existingCompany.website && <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <a href={existingCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {existingCompany.website}
                </a>
              </div>}
          </div> : tempCompany ? <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{tempCompany.company_name}</span>
            </div>
            
            {tempCompany.organization_number && <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Org. Number:</span>
                <span className="text-sm">{tempCompany.organization_number}</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(tempCompany.organization_number, 'Organization number')}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>}
            
            {tempCompany.website && <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <a href={tempCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {tempCompany.website}
                </a>
              </div>}
            
            {(tempCompany.street_address || tempCompany.city) && <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                <div className="text-sm">
                  {tempCompany.street_address && <div>{tempCompany.street_address}</div>}
                  <div>
                    {tempCompany.postal_code && `${tempCompany.postal_code} `}
                    {tempCompany.city}
                    {tempCompany.country && tempCompany.country !== 'Norway' && `, ${tempCompany.country}`}
                  </div>
                </div>
              </div>}
          </div> : <div className="text-gray-500 text-sm">No company information available</div>}

        {tempContact && <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact Information
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {tempContact.first_name} {tempContact.last_name}
                </span>
                {tempContact.position && <Badge variant="outline" className="text-xs">
                    {tempContact.position}
                  </Badge>}
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{tempContact.email}</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(tempContact.email, 'Email')}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              
              {tempContact.phone && <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{tempContact.phone}</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(tempContact.phone, 'Phone number')}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>}
            </div>
          </div>}
      </CardContent>
    </Card>;
};