
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  BadgeCheck, 
  Phone, 
  Mail, 
  Globe, 
  ExternalLink,
  Calendar,
  FileText
} from 'lucide-react';
import { Company } from '@/types/company';

interface CompanyHeroCardProps {
  company: Company;
}

export const CompanyHeroCard: React.FC<CompanyHeroCardProps> = ({ company }) => {
  const formatOrganizationNumber = (orgNumber: string | null): string => {
    if (!orgNumber) return '';
    const cleanNumber = orgNumber.replace(/\s+/g, '');
    return cleanNumber.replace(/(\d{3})(?=\d)/g, '$1 ');
  };

  return (
    <Card className="mb-8 bg-gradient-to-r from-white to-gray-50 border-gray-200 shadow-lg">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Logo and Basic Info */}
          <div className="flex items-center gap-6 flex-1">
            <div className="relative">
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={`${company.name} logo`} 
                  className="w-20 h-20 rounded-xl object-contain bg-white p-2 border shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center border shadow-sm">
                  <Building className="h-10 w-10 text-primary" />
                </div>
              )}
              {company.is_partner && (
                <div className="absolute -bottom-2 -right-2">
                  <Badge variant="partner" className="text-xs flex items-center gap-1 bg-blue-600 text-white">
                    <BadgeCheck className="h-3 w-3" />
                    Partner
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                <div className="flex gap-2">
                  {company.is_marketing_client && (
                    <Badge variant="marketing" className="bg-green-100 text-green-800 border-green-300">
                      Marketing
                    </Badge>
                  )}
                  {company.is_web_client && (
                    <Badge variant="web" className="bg-purple-100 text-purple-800 border-purple-300">
                      Web
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {company.organization_number && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Org.nr: {formatOrganizationNumber(company.organization_number)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(company.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {company.phone && (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${company.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </a>
              </Button>
            )}
            {company.invoice_email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${company.invoice_email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </a>
              </Button>
            )}
            {company.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-2" />
                  Visit
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
