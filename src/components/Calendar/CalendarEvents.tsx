
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

interface CalendarEventsProps {
  tasks: Task[];
  projects: Project[];
  onTaskClick: (taskId: string) => void;
  onProjectClick: (projectId: string) => void;
}

export const CalendarEvents: React.FC<CalendarEventsProps> = ({
  tasks,
  projects,
  onTaskClick,
  onProjectClick,
}) => {
  const maxVisibleEvents = 3;
  const totalEvents = tasks.length + projects.length;
  const visibleTasks = tasks.slice(0, Math.max(0, maxVisibleEvents - projects.length));
  const visibleProjects = projects.slice(0, Math.max(0, maxVisibleEvents - tasks.length));
  const hasMoreEvents = totalEvents > maxVisibleEvents;

  return (
    <div className="space-y-1">
      {/* Show projects first */}
      {visibleProjects.map(project => (
        <CalendarEventItem
          key={`project-${project.id}`}
          type="project"
          title={project.name}
          id={project.id}
          onClick={() => onProjectClick(project.id)}
        />
      ))}
      
      {/* Then show tasks */}
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
