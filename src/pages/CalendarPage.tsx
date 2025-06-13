
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TaskDetailSheet } from '@/components/Tasks/TaskDetailSheet';
import { useNavigate } from 'react-router-dom';
import { CalendarEvents } from '@/components/Calendar/CalendarEvents';
import { useCalendarData } from '@/hooks/useCalendarData';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  const navigate = useNavigate();

  const { tasks, projects, isLoading } = useCalendarData();

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get tasks and projects for a specific date
  const getEventsForDate = (date: Date) => {
    const dayTasks = tasks?.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(parseISO(task.due_date), date);
    }) || [];

    const dayProjects = projects?.filter(project => {
      if (!project.deadline) return false;
      return isSameDay(parseISO(project.deadline), date);
    }) || [];

    return { tasks: dayTasks, projects: dayProjects };
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskSheetOpen(true);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return (
      <div className="container p-6 mx-auto">
        <div className="flex justify-center items-center h-96">
          <div className="text-lg">Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">View tasks and project deadlines</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-4">
          {calendarDays.map(day => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] p-2 border rounded-lg ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'ring-2 ring-evergreen' : ''}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday ? 'text-evergreen font-bold' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                <CalendarEvents
                  tasks={dayEvents.tasks}
                  projects={dayEvents.projects}
                  onTaskClick={handleTaskClick}
                  onProjectClick={handleProjectClick}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        isOpen={isTaskSheetOpen}
        onOpenChange={setIsTaskSheetOpen}
        taskId={selectedTaskId}
      />
    </div>
  );
};

export default CalendarPage;
