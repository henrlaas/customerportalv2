
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Calendar, AlertTriangle, Clock } from 'lucide-react';

interface MonthlyOverviewCardsProps {
  monthlyStats: {
    totalTasks: number;
    totalProjects: number;
    overdueTasks: number;
    overdueProjects: number;
  };
}

export const MonthlyOverviewCards: React.FC<MonthlyOverviewCardsProps> = ({ monthlyStats }) => {
  const cards = [
    {
      title: 'Total Tasks',
      value: monthlyStats.totalTasks,
      icon: CheckSquare,
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      iconClassName: 'text-blue-500'
    },
    {
      title: 'Total Projects',
      value: monthlyStats.totalProjects,
      icon: Calendar,
      className: 'bg-green-50 text-green-700 border-green-200',
      iconClassName: 'text-green-500'
    },
    {
      title: 'Overdue Tasks',
      value: monthlyStats.overdueTasks,
      icon: AlertTriangle,
      className: 'bg-red-50 text-red-700 border-red-200',
      iconClassName: 'text-red-500'
    },
    {
      title: 'Overdue Projects',
      value: monthlyStats.overdueProjects,
      icon: Clock,
      className: 'bg-orange-50 text-orange-700 border-orange-200',
      iconClassName: 'text-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className={`${card.className} border`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${card.iconClassName}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
