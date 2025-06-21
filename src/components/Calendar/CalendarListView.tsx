
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckSquare, Megaphone } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  due_date: string;
}

interface Project {
  id: string;
  name: string;
  deadline: string;
  value?: number;
}

interface Campaign {
  id: string;
  name: string;
  start_date: string;
  platform?: string;
  status: string;
}

interface CalendarListViewProps {
  tasks: Task[];
  projects: Project[];
  campaigns: Campaign[];
  onTaskClick: (taskId: string) => void;
  onProjectClick: (projectId: string) => void;
  onCampaignClick: (campaignId: string) => void;
}

export const CalendarListView: React.FC<CalendarListViewProps> = ({
  tasks,
  projects,
  campaigns,
  onTaskClick,
  onProjectClick,
  onCampaignClick,
}) => {
  // Combine all events with their dates and types
  const allEvents = [
    ...tasks.map(task => ({
      ...task,
      date: task.due_date,
      type: 'task' as const,
      displayName: task.title,
    })),
    ...projects.map(project => ({
      ...project,
      date: project.deadline,
      type: 'project' as const,
      displayName: project.name,
    })),
    ...campaigns.map(campaign => ({
      ...campaign,
      date: campaign.start_date,
      type: 'campaign' as const,
      displayName: campaign.name,
    })),
  ];

  // Sort events by date
  const sortedEvents = allEvents.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group events by date
  const eventsByDate = sortedEvents.reduce((acc, event) => {
    const dateKey = format(parseISO(event.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, typeof sortedEvents>);

  const handleEventClick = (event: typeof sortedEvents[0]) => {
    if (event.type === 'task') {
      onTaskClick(event.id);
    } else if (event.type === 'project') {
      onProjectClick(event.id);
    } else if (event.type === 'campaign') {
      onCampaignClick(event.id);
    }
  };

  // Helper functions for styling and icons
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEventStyle = (event: typeof sortedEvents[0]) => {
    if (event.type === 'project') {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    if (event.type === 'campaign') {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    return getPriorityColor((event as any).priority);
  };

  const getEventIcon = (type: string) => {
    if (type === 'project') return Calendar;
    if (type === 'campaign') return Megaphone;
    return CheckSquare;
  };

  if (sortedEvents.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No events found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(eventsByDate).map(([dateKey, dayEvents]) => (
        <Card key={dateKey}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {format(parseISO(dayEvents[0].date), 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {dayEvents.map((event) => {
                const Icon = getEventIcon(event.type);
                const eventStyle = getEventStyle(event);
                
                return (
                  <div
                    key={`${event.type}-${event.id}`}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${eventStyle}`}
                    onClick={() => handleEventClick(event)}
                    title={`${event.displayName}${event.type === 'campaign' && (event as any).platform ? ` (${(event as any).platform})` : ''}`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 font-medium">{event.displayName}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
