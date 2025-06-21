
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

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No metrics available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side - Metric Cards (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Projects Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Projects Card */}
          <Card className="bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group border border-[#F2FCE2]/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-[#004743] transition-transform group-hover:scale-110" />
                  <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F2FCE2] text-[#004743]">
                    Projects
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Projects</span>
                  <span className="text-lg font-bold text-[#004743]">{metrics.totalProjects}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-lg font-bold text-[#004743]">{metrics.completedProjects}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overdue</span>
                  <span className="text-lg font-bold text-[#004743]">{metrics.overdueProjects}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Value Card */}
          <Card className="bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group border border-[#F2FCE2]/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#004743] transition-transform group-hover:scale-110" />
                  <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F2FCE2] text-[#004743]">
                    Project Value
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">
                  Completed Value
                </p>
                <div className="text-2xl font-bold text-[#004743]">
                  {formatCurrency(metrics.completedProjectsValue)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks and Contracts Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tasks Card */}
          <Card className="bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group border border-[#F2FCE2]/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-[#004743] transition-transform group-hover:scale-110" />
                  <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F2FCE2] text-[#004743]">
                    Tasks
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Tasks</span>
                  <span className="text-lg font-bold text-[#004743]">{metrics.totalTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-lg font-bold text-[#004743]">{metrics.completedTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-lg font-bold text-[#004743]">{metrics.uncompletedTasks}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contracts Card */}
          <Card className="bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group border border-[#F2FCE2]/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#004743] transition-transform group-hover:scale-110" />
                  <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F2FCE2] text-[#004743]">
                    Contracts
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Contracts</span>
                  <span className="text-lg font-bold text-[#004743]">{metrics.totalContracts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unsigned</span>
                  <span className="text-lg font-bold text-[#004743]">{metrics.unsignedContracts}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deals and Time Tracking Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deals Card */}
          <Card className="bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group border border-[#F2FCE2]/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#004743] transition-transform group-hover:scale-110" />
                  <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F2FCE2] text-[#004743]">
                    Deals
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Deals</span>
                  <span className="text-lg font-bold text-[#004743]">{metrics.totalDeals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Value</span>
                  <span className="text-lg font-bold text-[#004743]">{formatCurrency(metrics.totalDealsValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Tracking Card */}
          <Card className="bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group border border-[#F2FCE2]/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#004743] transition-transform group-hover:scale-110" />
                  <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F2FCE2] text-[#004743]">
                    This Month
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Hours</span>
                  <span className="text-lg font-bold text-[#004743]">{formatHours(metrics.totalHoursThisMonth)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Invoiceable</span>
                  <span className="text-lg font-bold text-[#004743]">{formatCurrency(metrics.invoiceableHoursThisMonth)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Recent Activities (1/3 width) */}
      <div className="space-y-6">
        {/* Recent Activities Section */}
        <Card className="bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group border border-[#F2FCE2]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#004743] transition-transform group-hover:scale-110" />
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
    </div>
  );
};
