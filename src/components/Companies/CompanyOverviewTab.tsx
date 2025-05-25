
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/types/company';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardList, 
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
  ExternalLink
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Building className="h-6 w-6 mr-3 text-primary" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Building className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Company Name</p>
                <p className="text-lg font-semibold text-gray-900 break-words">{company.name}</p>
              </div>
            </div>
            
            {company.organization_number && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <ClipboardList className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Organization Number</p>
                  <p className="text-base font-medium text-gray-900">{company.organization_number}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-base font-medium text-gray-900">{new Date(company.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Partner Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  {company.is_partner ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-700 font-medium">Partner Company</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Regular Company</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Client Type</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {company.is_marketing_client && (
                    <Badge variant="marketing" className="bg-green-100 text-green-800 border-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Marketing Client
                    </Badge>
                  )}
                  {company.is_web_client && (
                    <Badge variant="web" className="bg-purple-100 text-purple-800 border-purple-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Web Client
                    </Badge>
                  )}
                  {!company.is_marketing_client && !company.is_web_client && (
                    <span className="text-gray-500 italic">No active services</span>
                  )}
                </div>
              </div>
            </div>
            
            {company.is_marketing_client && company.mrr !== null && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-700">Monthly Recurring Revenue</p>
                  <p className="text-xl font-bold text-green-800">{company.mrr} kr</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600">Trial Period</p>
                <div className="flex items-center space-x-2 mt-1">
                  {company.trial_period ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-orange-700 font-medium">Active Trial</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">No Trial</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
              <Phone className="h-6 w-6 mr-3 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.website && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Globe className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Website</p>
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center space-x-1 mt-1 group"
                  >
                    <span className="break-all">{company.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            )}
            
            {company.phone && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Phone Number</p>
                  <p className="text-base font-medium text-gray-900">{company.phone}</p>
                </div>
              </div>
            )}
            
            {company.invoice_email && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Invoice Email</p>
                  <p className="text-base font-medium text-gray-900 break-all">{company.invoice_email}</p>
                </div>
              </div>
            )}
            
            {(company.street_address || company.city || company.postal_code || company.country) && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Address</p>
                  <p className="text-base font-medium text-gray-900 break-words mt-1">
                    {formatAddress()}
                  </p>
                </div>
              </div>
            )}
            
            {!company.website && !company.phone && !company.invoice_email && !company.street_address && (
              <div className="text-center py-8">
                <Phone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 italic">No contact information available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
