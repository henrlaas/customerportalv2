
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GreetingCard } from './GreetingCard';
import { NewsCard } from './NewsCard';
import { MyTasksCard } from './MyTasksCard';
import { MyDealsCard } from './MyDealsCard';
import { TimeTrackingCard } from './TimeTrackingCard';
import { MyProjectsCard } from './MyProjectsCard';
import { UpcomingDeadlinesCalendar } from './UpcomingDeadlinesCalendar';
import { TaskDetailSheet } from '@/components/Tasks/TaskDetailSheet';

export const UserDashboard = () => {
  const { profile } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskSheetOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Main Dashboard Content */}
        <div className="flex-1 p-6 pr-0">
          <div className="grid grid-cols-2 gap-6">
            {/* Row 1: Greeting - spans 2 columns */}
            <div className="col-span-2">
              <GreetingCard />
            </div>
            
            {/* Row 2: News Card - spans 2 columns */}
            <div className="col-span-2">
              <NewsCard />
            </div>
            
            {/* Row 3: 2x2 Grid of Cards */}
            <div>
              <MyTasksCard />
            </div>
            <div>
              <MyDealsCard />
            </div>
            <div>
              <TimeTrackingCard />
            </div>
            <div>
              <MyProjectsCard />
            </div>
          </div>
        </div>

        {/* Vertical separator */}
        <div className="w-px bg-border mx-6"></div>

        {/* Right Side Calendar */}
        <div className="w-80 py-6 pr-6">
          <UpcomingDeadlinesCalendar onTaskClick={handleTaskClick} />
        </div>
      </div>

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        isOpen={isTaskSheetOpen}
        onOpenChange={setIsTaskSheetOpen}
        taskId={selectedTaskId}
      />
    </div>
  );
};
