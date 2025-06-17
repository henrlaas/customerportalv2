
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { Calendar, CheckCircle, FolderOpen } from 'lucide-react';

interface UpcomingDeadlinesCalendarProps {
  onTaskClick: (taskId: string) => void;
}

export const UpcomingDeadlinesCalendar = ({ onTaskClick }: UpcomingDeadlinesCalendarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: upcomingItems, isLoading } = useQuery({
    queryKey: ['upcoming-deadlines', user?.id],
    queryFn: async () => {
      if (!user?.id) return { tasks: [], projects: [] };

      const now = new Date();
      const oneWeekFromNow = addDays(now, 7);

      // Get upcoming tasks
      const { data: taskAssignees, error: tasksError } = await supabase
        .from('task_assignees')
        .select(`
          task_id,
          tasks:task_id (
            id,
            title,
            due_date,
            status,
            priority
          )
        `)
        .eq('user_id', user.id);

      if (tasksError) throw tasksError;

      const tasks = taskAssignees?.map(ta => ta.tasks).filter(task => 
        task && 
        task.due_date && 
        task.status !== 'completed' &&
        new Date(task.due_date) >= now &&
        new Date(task.due_date) <= oneWeekFromNow
      ) || [];

      // Get upcoming projects
      const { data: projectAssignees, error: projectsError } = await supabase
        .from('project_assignees')
        .select(`
          project_id,
          projects:project_id (
            id,
            name,
            deadline
          )
        `)
        .eq('user_id', user.id);

      if (projectsError) throw projectsError;

      const projects = projectAssignees?.map(pa => pa.projects).filter(project => 
        project && 
        project.deadline && 
        new Date(project.deadline) >= now &&
        new Date(project.deadline) <= oneWeekFromNow
      ) || [];

      return { tasks, projects };
    },
    enabled: !!user?.id,
  });

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  // Create a week array
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="pb-2 flex-shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Deadlines
          </h2>
        </div>
        <div className="flex-1">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const { tasks = [], projects = [] } = upcomingItems || {};

  return (
    <div className="h-full flex flex-col">
      <div className="pb-2 flex-shrink-0">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Deadlines
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {weekDays.map((day, index) => {
            const dayTasks = tasks.filter(task => 
              task.due_date && isSameDay(parseISO(task.due_date), day)
            );
            const dayProjects = projects.filter(project => 
              project.deadline && isSameDay(parseISO(project.deadline), day)
            );
            
            const hasItems = dayTasks.length > 0 || dayProjects.length > 0;

            return (
              <div key={index} className="space-y-2">
                <div className={`text-sm font-medium ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : format(day, 'EEEE')}
                  <div className="text-xs opacity-75">{format(day, 'MMM d')}</div>
                </div>
                
                {hasItems ? (
                  <div className="space-y-1 pl-2">
                    {dayTasks.map(task => (
                      <div
                        key={task.id}
                        className="p-2 rounded border cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => onTaskClick(task.id)}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-blue-500" />
                          <span className="text-xs font-medium truncate">{task.title}</span>
                        </div>
                        <div className="text-xs text-muted-foreground ml-5">
                          Task • {task.priority}
                        </div>
                      </div>
                    ))}
                    
                    {dayProjects.map(project => (
                      <div
                        key={project.id}
                        className="p-2 rounded border cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleProjectClick(project.id)}
                      >
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-3 w-3 text-green-500" />
                          <span className="text-xs font-medium truncate">{project.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground ml-5">
                          Project deadline
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground pl-2 italic">
                    No deadlines
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
