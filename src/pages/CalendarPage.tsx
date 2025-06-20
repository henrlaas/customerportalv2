import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TaskDetailSheet } from '@/components/Tasks/TaskDetailSheet';
import { useNavigate } from 'react-router-dom';
import { CalendarEvents } from '@/components/Calendar/CalendarEvents';
import { CalendarListView } from '@/components/Calendar/CalendarListView';
import { MonthlyOverviewCards } from '@/components/Calendar/MonthlyOverviewCards';
import { CalendarPageSkeleton } from '@/components/Calendar/CalendarPageSkeleton';
import { useCalendarData } from '@/hooks/useCalendarData';
import { useRealtimeCalendar } from '@/hooks/realtime/useRealtimeCalendar';

type ViewMode = 'calendar' | 'list';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const navigate = useNavigate();

  const { tasks, projects, campaigns, monthlyStats, isLoading } = useCalendarData(currentDate);

  // Enable real-time updates for calendar data
  useRealtimeCalendar({
    enabled: true
  });

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter data by current month for list view
  const filterByCurrentMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthInterval = { start: monthStart, end: monthEnd };

    const filteredTasks = tasks?.filter(task => {
      if (!task.due_date) return false;
      const dueDate = parseISO(task.due_date);
      return isWithinInterval(dueDate, monthInterval);
    }) || [];

    const filteredProjects = projects?.filter(project => {
      if (!project.deadline) return false;
      const deadline = parseISO(project.deadline);
      return isWithinInterval(deadline, monthInterval);
    }) || [];

    const filteredCampaigns = campaigns?.filter(campaign => {
      if (!campaign.start_date) return false;
      const startDate = parseISO(campaign.start_date);
      return isWithinInterval(startDate, monthInterval);
    }) || [];

    return {
      tasks: filteredTasks,
      projects: filteredProjects,
      campaigns: filteredCampaigns
    };
  };

  const monthFilteredData = filterByCurrentMonth();

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dayTasks = tasks?.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(parseISO(task.due_date), date);
    }) || [];

    const dayProjects = projects?.filter(project => {
      if (!project.deadline) return false;
      return isSameDay(parseISO(project.deadline), date);
    }) || [];

    const dayCampaigns = campaigns?.filter(campaign => {
      if (!campaign.start_date) return false;
      return isSameDay(parseISO(campaign.start_date), date);
    }) || [];

    return { tasks: dayTasks, projects: dayProjects, campaigns: dayCampaigns };
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskSheetOpen(true);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleCampaignClick = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
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
    return <CalendarPageSkeleton viewMode={viewMode} />;
  }

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">View tasks, projects, and campaign deadlines</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-2">
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
      </div>

      {/* Monthly Overview Cards */}
      <MonthlyOverviewCards monthlyStats={monthlyStats} />

      {/* Calendar or List View */}
      {viewMode === 'calendar' ? (
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
                    campaigns={dayEvents.campaigns}
                    onTaskClick={handleTaskClick}
                    onProjectClick={handleProjectClick}
                    onCampaignClick={handleCampaignClick}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <CalendarListView
          tasks={monthFilteredData.tasks}
          projects={monthFilteredData.projects}
          campaigns={monthFilteredData.campaigns}
          onTaskClick={handleTaskClick}
          onProjectClick={handleProjectClick}
          onCampaignClick={handleCampaignClick}
        />
      )}

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
