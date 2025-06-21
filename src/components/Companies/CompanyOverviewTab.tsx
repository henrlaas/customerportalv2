
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side - Main content (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Company Overview */}
        <Card className="bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group border border-[#F2FCE2]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#004743] transition-transform group-hover:scale-110" />
              Company Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-[#004743] border-t-transparent rounded-full"></div>
              </div>
            ) : metrics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Projects Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-[#004743] flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-[#004743]" />
                    Projects
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 rounded-lg border border-[#F2FCE2]/30 hover:shadow-md transition-all duration-200">
                      <span className="text-sm text-[#004743] opacity-80">Total Projects</span>
                      <span className="font-semibold text-[#004743]">{metrics.totalProjects}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 rounded-lg border border-[#F2FCE2]/30 hover:shadow-md transition-all duration-200">
                      <span className="text-sm text-[#004743] opacity-80">Completed</span>
                      <span className="font-semibold text-[#004743]">{metrics.completedProjects}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 rounded-lg border border-[#F2FCE2]/30 hover:shadow-md transition-all duration-200">
                      <span className="text-sm text-[#004743] opacity-80">Completed Value</span>
                      <span className="font-semibold text-[#004743]">{formatCurrency(metrics.completedProjectsValue)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 rounded-lg border border-[#F2FCE2]/30 hover:shadow-md transition-all duration-200">
                      <span className="text-sm text-[#004743] opacity-80">Overdue</span>
                      <span className="font-semibold text-[#004743]">{metrics.overdueProjects}</span>
                    </div>
                  </div>
                </div>

                {/* Contracts & Tasks Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-[#004743] flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#004743]" />
                    Contracts
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 rounded-lg border border-[#F2FCE2]/30 hover:shadow-md transition-all duration-200">
                      <span className="text-sm text-[#004743] opacity-80">Total Contracts</span>
                      <span className="font-semibold text-[#004743]">{metrics.totalContracts}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 rounded-lg border border-[#F2FCE2]/30 hover:shadow-md transition-all duration-200">
                      <span className="text-sm text-[#004743] opacity-80">Unsigned</span>
                      <span className="font-semibold text-[#004743]">{metrics.unsignedContracts}</span>
                    </div>
                  </div>

                  <h4 className="font-medium text-[#004743] flex items-center gap-2 mt-4">
                    <CheckSquare className="h-4 w-4 text-[#004743]" />
                    Tasks
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 rounded-lg border border-[#F2FCE2]/30 hover:shadow-md transition-all duration-200">
                      <span className="text-sm text-[#004743] opacity-80">Total Tasks</span>
                      <span className="font-semibold text-[#004743]">{metrics.totalTasks}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 rounded-lg border border-[#F2FCE2]/30 hover:shadow-md transition-all duration-200">
                      <span className="text-sm text-[#004743] opacity-80">Completed</span>
                      <span className="font-semibold text-[#004743]">{metrics.completedTasks}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 rounded-lg border border-[#F2FCE2]/30 hover:shadow-md transition-all duration-200">
                      <span className="text-sm text-[#004743] opacity-80">Pending</span>
                      <span className="font-semibold text-[#004743]">{metrics.uncompletedTasks}</span>
                    </div>
                  </div>
                </div>

                {/* Deals & Time Tracking Section */}
                <div className="space-y-4">
                  <h4 className="font-medium text-[#004743] flex items-center gap-2">
                    <Target className="h-4 w-4 text-[#004743]" />
                    Deals
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 rounded-lg border border-[#F2FCE2]/30 hover:shadow-md transition-all duration-200">
                      <span className="text-sm text-[#004743] opacity-80">Total Deals</span>
                      <span className="font-semibold text-[#004743]">{metrics.totalDeals}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 rounded-lg border border-[#F2FCE2]/30 hover:shadow-md transition-all duration-200">
                      <span className="text-sm text-[#004743] opacity-80">Total Value</span>
                      <span className="font-semibold text-[#004743]">{formatCurrency(metrics.totalDealsValue)}</span>
                    </div>
                  </div>

                  <h4 className="font-medium text-[#004743] flex items-center gap-2 mt-4">
                    <Clock className="h-4 w-4 text-[#004743]" />
                    Time This Month
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 rounded-lg border border-[#F2FCE2]/30 hover:shadow-md transition-all duration-200">
                      <span className="text-sm text-[#004743] opacity-80">Total Hours</span>
                      <span className="font-semibold text-[#004743]">{formatHours(metrics.totalHoursThisMonth)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 rounded-lg border border-[#F2FCE2]/30 hover:shadow-md transition-all duration-200">
                      <span className="text-sm text-[#004743] opacity-80">Invoiceable</span>
                      <span className="font-semibold text-[#004743]">{formatCurrency(metrics.invoiceableHoursThisMonth)}</span>
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
      </div>

      {/* Right side - Recent Activities (1/3 width) */}
      <div className="space-y-6">
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
    </div>
  );
};
