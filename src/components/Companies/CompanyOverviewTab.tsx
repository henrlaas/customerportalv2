
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
  Activity,
  FolderOpen,
  CheckSquare,
  Target,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useCompanyActivities } from '@/hooks/useCompanyActivities';
import { useCompanyMetrics } from '@/hooks/useCompanyMetrics';
import { CompanyActivityItem } from './CompanyActivityItem';

interface CompanyOverviewTabProps {
  company: Company;
}

export const CompanyOverviewTab = ({ company }: CompanyOverviewTabProps) => {
  const { data: activities, isLoading: activitiesLoading } = useCompanyActivities(company.id);
  const { data: metrics, isLoading: metricsLoading } = useCompanyMetrics(company.id);

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

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatHours = (hours: number) => {
    return hours.toFixed(1) + 'h';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side - Main content (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Company Overview (renamed from Business Information) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Company Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : metrics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Projects Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-blue-600" />
                    Projects
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-700">Total Projects</span>
                      <span className="font-semibold text-blue-800">{metrics.totalProjects}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-700">Completed</span>
                      <span className="font-semibold text-blue-800">{metrics.completedProjects}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-700">Completed Value</span>
                      <span className="font-semibold text-blue-800">{formatCurrency(metrics.completedProjectsValue)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-700">Overdue</span>
                      <span className="font-semibold text-blue-800">{metrics.overdueProjects}</span>
                    </div>
                  </div>
                </div>

                {/* Contracts & Tasks Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    Contracts
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-purple-700">Total Contracts</span>
                      <span className="font-semibold text-purple-800">{metrics.totalContracts}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-purple-700">Unsigned</span>
                      <span className="font-semibold text-purple-800">{metrics.unsignedContracts}</span>
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-900 flex items-center gap-2 mt-4">
                    <CheckSquare className="h-4 w-4 text-green-600" />
                    Tasks
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-green-700">Total Tasks</span>
                      <span className="font-semibold text-green-800">{metrics.totalTasks}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-green-700">Completed</span>
                      <span className="font-semibold text-green-800">{metrics.completedTasks}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-green-700">Pending</span>
                      <span className="font-semibold text-green-800">{metrics.uncompletedTasks}</span>
                    </div>
                  </div>
                </div>

                {/* Deals & Time Tracking Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    Deals
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm text-orange-700">Total Deals</span>
                      <span className="font-semibold text-orange-800">{metrics.totalDeals}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm text-orange-700">Total Value</span>
                      <span className="font-semibold text-orange-800">{formatCurrency(metrics.totalDealsValue)}</span>
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-900 flex items-center gap-2 mt-4">
                    <Clock className="h-4 w-4 text-indigo-600" />
                    Time This Month
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm text-indigo-700">Total Hours</span>
                      <span className="font-semibold text-indigo-800">{formatHours(metrics.totalHoursThisMonth)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm text-indigo-700">Invoiceable</span>
                      <span className="font-semibold text-indigo-800">{formatCurrency(metrics.invoiceableHoursThisMonth)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No metrics available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-2">
                {activities.map((activity) => (
                  <CompanyActivityItem 
                    key={`${activity.type}-${activity.id}`} 
                    activity={activity} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent activities</p>
                <p className="text-sm text-gray-400 mt-1">Activities and notes will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right side - Contact info (1/3 width) */}
      <div className="space-y-6">
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
