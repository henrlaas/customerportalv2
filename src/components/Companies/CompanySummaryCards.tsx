
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Phone, Mail, Globe, MapPin, Users, Calendar, ExternalLink, Shield } from 'lucide-react';
import { Company } from '@/types/company';

interface CompanySummaryCardsProps {
  company: Company;
}

export const CompanySummaryCards: React.FC<CompanySummaryCardsProps> = ({
  company
}) => {
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Not set';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const formatAddress = () => {
    const parts = [];
    if (company.street_address) parts.push(company.street_address);
    if (company.postal_code && company.city) {
      parts.push(`${company.postal_code} ${company.city}`);
    } else if (company.city) {
      parts.push(company.city);
    }
    if (company.country) parts.push(company.country);
    return parts.join(', ') || 'No address provided';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Financial Card */}
      <Card className="bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group border border-[#F2FCE2]/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#004743] transition-transform group-hover:scale-110" />
              <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F2FCE2] text-[#004743]">
                Financial
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 opacity-80">
              Monthly Revenue
            </p>
            
            {company.is_marketing_client && company.mrr !== null ? (
              <div className="text-3xl font-bold text-[#004743]">
                {formatCurrency(company.mrr)}
              </div>
            ) : (
              <div className="text-3xl font-bold text-gray-400">
                No data
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Card */}
      <Card className="bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group border border-[#F2FCE2]/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-[#004743] transition-transform group-hover:scale-110" />
              <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F2FCE2] text-[#004743]">
                Contact
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {company.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#004743]" />
                <a href={`tel:${company.phone}`} className="text-sm hover:text-[#004743] transition-colors text-gray-600">
                  {company.phone}
                </a>
              </div>
            )}
            {company.invoice_email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#004743]" />
                <a href={`mailto:${company.invoice_email}`} className="text-sm hover:text-[#004743] transition-colors truncate text-gray-600">
                  {company.invoice_email}
                </a>
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#004743]" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-[#004743] transition-colors flex items-center gap-1 text-gray-600">
                  <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {!company.phone && !company.invoice_email && !company.website && (
              <p className="text-sm text-gray-500">No contact info</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Card */}
      <Card className="bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group border border-[#F2FCE2]/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#004743] transition-transform group-hover:scale-110" />
              <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F2FCE2] text-[#004743]">
                Location
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide opacity-80">Address</p>
              <p className="text-sm text-[#004743] leading-relaxed font-medium">{formatAddress()}</p>
            </div>
            {company.organization_number && (
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide opacity-80">Org. Number</p>
                <p className="text-sm font-mono text-[#004743] font-medium">{company.organization_number}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card className="bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group border border-[#F2FCE2]/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#004743] transition-transform group-hover:scale-110" />
              <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F2FCE2] text-[#004743]">
                Status
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {company.is_partner && (
                <Badge variant="outline" className="bg-[#F2FCE2] text-[#004743] border-[#004743]/30">
                  <Shield className="h-3 w-3 mr-1" />
                  Partner
                </Badge>
              )}
              {company.is_marketing_client && (
                <Badge variant="outline" className="bg-[#F2FCE2] text-[#004743] border-[#004743]/30">
                  Marketing
                </Badge>
              )}
              {company.is_web_client && (
                <Badge variant="outline" className="bg-[#F2FCE2] text-[#004743] border-[#004743]/30">
                  Web
                </Badge>
              )}
              {company.trial_period && (
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                  Trial Active
                </Badge>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide opacity-80">Created</p>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-[#004743]" />
                <p className="text-sm text-[#004743] font-medium">{new Date(company.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
