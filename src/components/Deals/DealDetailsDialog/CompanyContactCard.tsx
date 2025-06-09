import React from 'react';
import { Building, Mail, Phone, Globe, Copy, MapPin, Hash, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Deal, Company } from '@/components/Deals/types/deal';
import { getCompanyName } from '@/components/Deals/utils/formatters';

interface CompanyContactCardProps {
  deal: Deal;
  companies: Company[];
  tempCompanies: any;
}

export const CompanyContactCard: React.FC<CompanyContactCardProps> = ({
  deal,
  companies,
  tempCompanies,
}) => {
  const { toast } = useToast();
  
  const tempCompany = tempCompanies?.find((tc: any) => tc.deal_id === deal.id);
  const isTemporaryCompany = !deal.company_id && tempCompany;
  const existingCompany = deal.company_id ? companies.find(c => c.id === deal.company_id) : null;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        description: `${label} copied successfully`,
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  if (!isTemporaryCompany && !existingCompany) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No company assigned to this deal</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Company Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Company Name and Type */}
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-lg">
            {getCompanyName(deal.company_id, companies, tempCompanies, deal.id)}
          </h4>
          {isTemporaryCompany && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              New Company
            </Badge>
          )}
        </div>

        {/* Temporary Company Details */}
        {isTemporaryCompany && tempCompany && (
          <div className="space-y-3">
            {/* Organization Number */}
            {tempCompany.organization_number && (
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Org. Number:</span>
                  <span className="font-mono">{tempCompany.organization_number}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(tempCompany.organization_number, 'Organization number')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Website */}
            {tempCompany.website && (
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Website:</span>
                  <a 
                    href={tempCompany.website.startsWith('http') ? tempCompany.website : `https://${tempCompany.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {tempCompany.website}
                  </a>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(tempCompany.website, 'Website')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Address */}
            {(tempCompany.street_address || tempCompany.city || tempCompany.postal_code || tempCompany.country) && (
              <div className="p-2 bg-muted/50 rounded">
                <div className="flex items-start gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm font-medium">Address:</span>
                </div>
                <div className="ml-6 text-sm space-y-1">
                  {tempCompany.street_address && <div>{tempCompany.street_address}</div>}
                  <div className="flex gap-2">
                    {tempCompany.postal_code && <span>{tempCompany.postal_code}</span>}
                    {tempCompany.city && <span>{tempCompany.city}</span>}
                  </div>
                  {tempCompany.country && <div>{tempCompany.country}</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Existing Company Details */}
        {existingCompany && (
          <div className="text-sm text-muted-foreground">
            <p>Existing company in system</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
