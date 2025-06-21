
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Calendar, AlertTriangle, Clock, Megaphone, TrendingUp } from 'lucide-react';

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
  const cards = [
    {
      title: 'Total Tasks',
      value: monthlyStats.totalTasks,
      icon: CheckSquare,
      type: 'total',
      overdue: monthlyStats.overdueTasks
    },
    {
      title: 'Total Projects',
      value: monthlyStats.totalProjects,
      icon: Calendar,
      type: 'total',
      overdue: monthlyStats.overdueProjects
    },
    {
      title: 'Total Campaigns',
      value: monthlyStats.totalCampaigns,
      icon: Megaphone,
      type: 'total',
      overdue: monthlyStats.overdueCampaigns
    },
    {
      title: 'Overdue Tasks',
      value: monthlyStats.overdueTasks,
      icon: AlertTriangle,
      type: 'overdue'
    },
    {
      title: 'Overdue Projects',
      value: monthlyStats.overdueProjects,
      icon: Clock,
      type: 'overdue'
    },
    {
      title: 'Overdue Campaigns',
      value: monthlyStats.overdueCampaigns,
      icon: TrendingUp,
      type: 'overdue'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isOverdueCard = card.type === 'overdue';
        const hasOverdue = card.type === 'total' && card.overdue && card.overdue > 0;
        const isHealthy = card.type === 'total' && (!card.overdue || card.overdue === 0);

        return (
          <Card 
            key={index} 
            className={`bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group border border-[#F2FCE2]/30 ${
              isOverdueCard && card.value > 0 ? 'ring-1 ring-red-200' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                    isOverdueCard && card.value > 0 
                      ? 'text-red-500' 
                      : 'text-[#004743]'
                  }`} />
                  {card.type === 'total' && (
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      isHealthy 
                        ? 'bg-[#F2FCE2] text-[#004743]' 
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {isHealthy ? 'On Track' : 'Alert'}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 opacity-80">
                  {card.title}
                </p>
                
                <div className="flex items-end justify-between">
                  <div className={`text-3xl font-bold ${
                    isOverdueCard && card.value > 0 
                      ? 'text-red-600' 
                      : 'text-[#004743]'
                  }`}>
                    {card.value}
                  </div>
                  
                  {card.type === 'total' && card.overdue !== undefined && (
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        card.overdue > 0 ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {card.overdue}
                      </div>
                      <div className="text-xs text-gray-500">overdue</div>
                    </div>
                  )}
                </div>
                
                {card.type === 'total' && card.value > 0 && (
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          hasOverdue 
                            ? 'bg-gradient-to-r from-red-400 to-red-500' 
                            : 'bg-gradient-to-r from-[#004743] to-[#004743]/80'
                        }`}
                        style={{ 
                          width: hasOverdue 
                            ? `${Math.min((card.overdue! / card.value) * 100, 100)}%`
                            : '100%'
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {hasOverdue 
                        ? `${Math.round((card.overdue! / card.value) * 100)}% overdue`
                        : 'All on track'
                      }
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
