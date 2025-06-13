
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
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="text-right">
              <p className="text-sm text-green-700 font-medium">Financial</p>
            </div>
          </div>
          <div className="space-y-3">
            {company.is_marketing_client && company.mrr !== null && (
              <div>
                <p className="text-xs text-green-600 uppercase tracking-wide">Monthly Revenue</p>
                <p className="text-xl font-bold text-green-800">{formatCurrency(company.mrr)}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-1">
              {!company.mrr && (
                <p className="text-sm text-gray-500">No financial data</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Phone className="h-8 w-8 text-blue-600" />
            <div className="text-right">
              <p className="text-sm text-blue-700 font-medium">Contact</p>
            </div>
          </div>
          <div className="space-y-3">
            {company.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-500" />
                <a href={`tel:${company.phone}`} className="text-sm hover:text-blue-600 transition-colors">
                  {company.phone}
                </a>
              </div>
            )}
            {company.invoice_email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <a href={`mailto:${company.invoice_email}`} className="text-sm hover:text-blue-600 transition-colors truncate">
                  {company.invoice_email}
                </a>
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-blue-600 transition-colors flex items-center gap-1">
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
      <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <MapPin className="h-8 w-8 text-purple-600" />
            <div className="text-right">
              <p className="text-sm text-purple-700 font-medium">Location</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-purple-600 uppercase tracking-wide">Address</p>
              <p className="text-sm text-purple-800 leading-relaxed">{formatAddress()}</p>
            </div>
            {company.organization_number && (
              <div>
                <p className="text-xs text-purple-600 uppercase tracking-wide">Org. Number</p>
                <p className="text-sm font-mono text-purple-800">{company.organization_number}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-amber-600" />
            <div className="text-right">
              <p className="text-sm text-amber-700 font-medium">Status</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {company.is_partner && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                  <Shield className="h-3 w-3 mr-1" />
                  Partner
                </Badge>
              )}
              {company.is_marketing_client && (
                <Badge variant="marketing" className="bg-green-50 text-green-700 border-green-300">
                  Marketing
                </Badge>
              )}
              {company.is_web_client && (
                <Badge variant="web" className="bg-purple-50 text-purple-700 border-purple-300">
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
              <p className="text-xs text-amber-600 uppercase tracking-wide">Created</p>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-amber-500" />
                <p className="text-sm text-amber-800">{new Date(company.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
