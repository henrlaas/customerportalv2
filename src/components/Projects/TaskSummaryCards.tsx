
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';

interface TaskSummaryCardsProps {
  tasks: any[];
}

export const TaskSummaryCards: React.FC<TaskSummaryCardsProps> = ({ tasks }) => {
  const getTaskStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = {
      total: tasks.length,
      completed: 0,
      upcoming: 0,
      dueToday: 0,
      overdue: 0
    };

    tasks.forEach(task => {
      if (task.status === 'completed') {
        stats.completed++;
      } else if (task.due_date) {
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);
        
        if (dueDate.getTime() === today.getTime()) {
          stats.dueToday++;
        } else if (dueDate < today) {
          stats.overdue++;
        } else {
          stats.upcoming++;
        }
      } else {
        stats.upcoming++;
      }
    });

    return stats;
  };

  const stats = getTaskStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Task Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-600 font-medium">Total Tasks</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-green-600 font-medium">Completed</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.dueToday}</div>
            <div className="text-sm text-orange-600 font-medium">Due Today</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-red-600 font-medium">Overdue</div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{stats.upcoming} upcoming</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
