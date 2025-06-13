
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/types/company';
import { 
  Building, 
  Phone, 
  Globe, 
  Mail, 
  MapPin, 
  DollarSign, 
  Calendar,
  Shield,
  Users,
  CheckCircle,
  XCircle,
  ExternalLink,
  FileText,
  TrendingUp
} from 'lucide-react';

interface CompanyOverviewTabProps {
  company: Company;
}

export const CompanyOverviewTab = ({ company }: CompanyOverviewTabProps) => {
  // Format address into a single line
  const formatAddress = () => {
    const parts = [];
    if (company.street_address) parts.push(company.street_address);
    if (company.postal_code && company.city) {
      parts.push(`${company.postal_code} ${company.city}`);
    } else if (company.city) {
      parts.push(company.city);
    } else if (company.postal_code) {
      parts.push(company.postal_code);
    }
    if (company.country) parts.push(company.country);
    return parts.join(', ');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side - Main content (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Services */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Client Services
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Marketing Client</span>
                    {company.is_marketing_client ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Web Client</span>
                    {company.is_web_client ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Partner Status</span>
                    {company.is_partner ? (
                      <Badge variant="partner" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Partner
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500">Regular Client</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Financial Information
                </h4>
                <div className="space-y-3">
                  {company.is_marketing_client && company.mrr !== null ? (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700 font-medium">Monthly Recurring Revenue</p>
                      <p className="text-2xl font-bold text-green-800 mt-1">
                        {company.mrr.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'NOK',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">No MRR data available</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Trial Period</span>
                    {company.trial_period ? (
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                        Active Trial
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500">No Trial</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Activities / Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent activities</p>
              <p className="text-sm text-gray-400 mt-1">Activities and notes will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Detailed info (1/3 width) */}
      <div className="space-y-6">
        {/* Detailed Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Company Name</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{company.name}</p>
              </div>
              
              {company.organization_number && (
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Organization Number</p>
                  <p className="text-sm font-mono text-gray-900 mt-1">{company.organization_number}</p>
                </div>
              )}
              
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Created</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-900">{new Date(company.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.website && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Website</p>
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 mt-1"
                >
                  <Globe className="h-4 w-4" />
                  {company.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            
            {company.phone && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Phone Number</p>
                <a href={`tel:${company.phone}`} className="text-sm text-gray-900 hover:text-blue-600 inline-flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4" />
                  {company.phone}
                </a>
              </div>
            )}
            
            {company.invoice_email && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Invoice Email</p>
                <a href={`mailto:${company.invoice_email}`} className="text-sm text-gray-900 hover:text-blue-600 inline-flex items-center gap-2 mt-1 break-all">
                  <Mail className="h-4 w-4" />
                  {company.invoice_email}
                </a>
              </div>
            )}
            
            {(company.street_address || company.city || company.postal_code || company.country) && (
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Address</p>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-900 leading-relaxed">{formatAddress()}</p>
                </div>
              </div>
            )}
            
            {!company.website && !company.phone && !company.invoice_email && !company.street_address && (
              <div className="text-center py-6">
                <Phone className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No contact information available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
