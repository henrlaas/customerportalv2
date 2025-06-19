
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarEventItem } from './CalendarEventItem';

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
              {dayEvents.map((event) => (
                <div
                  key={`${event.type}-${event.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex items-center gap-3">
                    <CalendarEventItem
                      type={event.type}
                      title={event.displayName}
                      id={event.id}
                      priority={event.type === 'task' ? (event as any).priority : undefined}
                      platform={event.type === 'campaign' ? (event as any).platform : undefined}
                      onClick={() => {}} // Handled by parent div
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(parseISO(event.date), 'HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
