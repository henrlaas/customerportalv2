
import React from 'react';
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

interface CalendarEventsProps {
  tasks: Task[];
  projects: Project[];
  campaigns: Campaign[];
  onTaskClick: (taskId: string) => void;
  onProjectClick: (projectId: string) => void;
  onCampaignClick: (campaignId: string) => void;
}

export const CalendarEvents: React.FC<CalendarEventsProps> = ({
  tasks,
  projects,
  campaigns,
  onTaskClick,
  onProjectClick,
  onCampaignClick,
}) => {
  const maxVisibleEvents = 3;
  const totalEvents = tasks.length + projects.length + campaigns.length;
  
  // Prioritize display: campaigns first, then projects, then tasks
  const visibleCampaigns = campaigns.slice(0, Math.min(campaigns.length, maxVisibleEvents));
  const remainingSlots = maxVisibleEvents - visibleCampaigns.length;
  
  const visibleProjects = projects.slice(0, Math.min(projects.length, remainingSlots));
  const finalSlots = remainingSlots - visibleProjects.length;
  
  const visibleTasks = tasks.slice(0, Math.min(tasks.length, finalSlots));
  
  const hasMoreEvents = totalEvents > maxVisibleEvents;

  return (
    <div className="space-y-1">
      {/* Show campaigns first */}
      {visibleCampaigns.map(campaign => (
        <CalendarEventItem
          key={`campaign-${campaign.id}`}
          type="campaign"
          title={campaign.name}
          id={campaign.id}
          platform={campaign.platform}
          onClick={() => onCampaignClick(campaign.id)}
        />
      ))}
      
      {/* Then show projects */}
      {visibleProjects.map(project => (
        <CalendarEventItem
          key={`project-${project.id}`}
          type="project"
          title={project.name}
          id={project.id}
          onClick={() => onProjectClick(project.id)}
        />
      ))}
      
      {/* Finally show tasks */}
      {visibleTasks.map(task => (
        <CalendarEventItem
          key={`task-${task.id}`}
          type="task"
          title={task.title}
          id={task.id}
          priority={task.priority}
          onClick={() => onTaskClick(task.id)}
        />
      ))}
      
      {/* Show "more" indicator if there are additional events */}
      {hasMoreEvents && (
        <div className="text-xs text-muted-foreground truncate">
          +{totalEvents - maxVisibleEvents} more
        </div>
      )}
    </div>
  );
};
