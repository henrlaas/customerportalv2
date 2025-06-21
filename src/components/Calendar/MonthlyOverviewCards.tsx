
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Calendar, AlertTriangle, Clock, Megaphone, TrendingUp, AlertCircle } from 'lucide-react';

interface MonthlyOverviewCardsProps {
  monthlyStats: {
    totalTasks: number;
    totalProjects: number;
    totalCampaigns: number;
    overdueTasks: number;
    overdueProjects: number;
    overdueCampaigns: number;
  };
}

export const MonthlyOverviewCards: React.FC<MonthlyOverviewCardsProps> = ({ monthlyStats }) => {
  const totalItems = monthlyStats.totalTasks + monthlyStats.totalProjects + monthlyStats.totalCampaigns;
  const overdueItems = monthlyStats.overdueTasks + monthlyStats.overdueProjects + monthlyStats.overdueCampaigns;
  const healthPercentage = totalItems > 0 ? Math.round(((totalItems - overdueItems) / totalItems) * 100) : 100;

  const mainCards = [
    {
      title: 'Tasks',
      total: monthlyStats.totalTasks,
      overdue: monthlyStats.overdueTasks,
      icon: CheckSquare,
      gradient: 'from-[#004743]/10 to-[#F2FCE2]/30',
      accentColor: 'text-[#004743]',
      category: 'Execution'
    },
    {
      title: 'Projects',
      total: monthlyStats.totalProjects,
      overdue: monthlyStats.overdueProjects,
      icon: Calendar,
      gradient: 'from-blue-50 to-blue-100/50',
      accentColor: 'text-blue-600',
      category: 'Management'
    },
    {
      title: 'Campaigns',
      total: monthlyStats.totalCampaigns,
      overdue: monthlyStats.overdueCampaigns,
      icon: Megaphone,
      gradient: 'from-purple-50 to-purple-100/50',
      accentColor: 'text-purple-600',
      category: 'Marketing'
    }
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Overall Health Summary */}
      <Card className="bg-gradient-to-r from-[#004743]/5 via-white to-[#F2FCE2]/20 border-[#F2FCE2]/50 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#004743]/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-[#004743]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#004743]">Monthly Overview</h3>
                <p className="text-sm text-gray-600">Calendar health status</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-bold text-[#004743]">{healthPercentage}%</span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  healthPercentage >= 90 ? 'bg-[#F2FCE2] text-[#004743]' :
                  healthPercentage >= 70 ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {healthPercentage >= 90 ? 'Excellent' : healthPercentage >= 70 ? 'Good' : 'Needs Attention'}
                </div>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#004743] to-[#004743]/80 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${healthPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mainCards.map((card, index) => {
          const Icon = card.icon;
          const isHealthy = card.overdue === 0;
          const completionRate = card.total > 0 ? Math.round(((card.total - card.overdue) / card.total) * 100) : 100;

          return (
            <Card key={index} className={`bg-gradient-to-br ${card.gradient} hover:shadow-xl transition-all duration-300 group border-2 border-transparent hover:border-[#F2FCE2]/30`}>
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/80 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                      <Icon className={`h-5 w-5 ${card.accentColor}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{card.title}</h4>
                      <p className="text-xs text-gray-500">{card.category}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isHealthy ? 'bg-[#F2FCE2]/60 text-[#004743]' : 'bg-red-100/80 text-red-700'
                  }`}>
                    {isHealthy ? 'On Track' : 'Review Needed'}
                  </div>
                </div>

                {/* Main Metric */}
                <div className="mb-4">
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-bold ${card.accentColor}`}>
                      {card.total}
                    </span>
                    <span className="text-gray-600 mb-1">total</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200/60 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          card.title === 'Tasks' ? 'bg-gradient-to-r from-[#004743] to-[#004743]/80' :
                          card.title === 'Projects' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          'bg-gradient-to-r from-purple-500 to-purple-600'
                        }`}
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>{completionRate}% on track</span>
                      <span>{card.total - card.overdue} / {card.total}</span>
                    </div>
                  </div>
                </div>

                {/* Overdue Section */}
                {card.overdue > 0 && (
                  <div className="bg-red-50/80 rounded-lg p-3 border border-red-100">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-red-700">
                        {card.overdue} overdue
                      </span>
                    </div>
                  </div>
                )}

                {card.overdue === 0 && (
                  <div className="bg-[#F2FCE2]/40 rounded-lg p-3 border border-[#F2FCE2]">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-[#004743]" />
                      <span className="text-sm font-medium text-[#004743]">
                        All items on schedule
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Critical Alerts Summary */}
      {overdueItems > 0 && (
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-800">Action Required</h4>
                  <p className="text-sm text-red-600">
                    {overdueItems} overdue item{overdueItems > 1 ? 's' : ''} need immediate attention
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">{overdueItems}</div>
                <div className="text-xs text-red-500">Total overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
