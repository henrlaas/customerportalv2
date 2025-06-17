
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, FolderOpen } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface DeadlineItem {
  id: string;
  title: string;
  due_date: string;
  type: 'task' | 'project';
}

export const DashboardCalendar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: upcomingDeadlines, isLoading } = useQuery({
    queryKey: ['upcoming-deadlines', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const now = new Date();
      const weekEnd = endOfWeek(addDays(now, 7));

      // Get upcoming task deadlines
      const { data: taskDeadlines, error: taskError } = await supabase
        .from('task_assignees')
        .select(`
          tasks (
            id,
            title,
            due_date
          )
        `)
        .eq('user_id', user.id);

      if (taskError) throw taskError;

      // Get upcoming project deadlines
      const { data: projectDeadlines, error: projectError } = await supabase
        .from('project_assignees')
        .select(`
          projects (
            id,
            name,
            deadline
          )
        `)
        .eq('user_id', user.id);

      if (projectError) throw projectError;

      const deadlines: DeadlineItem[] = [];

      // Process task deadlines
      taskDeadlines?.forEach(ta => {
        const task = ta.tasks;
        if (task?.due_date && new Date(task.due_date) <= weekEnd && new Date(task.due_date) >= now) {
          deadlines.push({
            id: task.id,
            title: task.title,
            due_date: task.due_date,
            type: 'task'
          });
        }
      });

      // Process project deadlines
      projectDeadlines?.forEach(pa => {
        const project = pa.projects;
        if (project?.deadline && new Date(project.deadline) <= weekEnd && new Date(project.deadline) >= now) {
          deadlines.push({
            id: project.id,
            title: project.name,
            due_date: project.deadline,
            type: 'project'
          });
        }
      });

      // Sort by due date
      return deadlines.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleItemClick = (item: DeadlineItem) => {
    if (item.type === 'task') {
      navigate(`/tasks?taskId=${item.id}`);
    } else {
      navigate(`/projects/${item.id}`);
    }
  };

  if (isLoading) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingDeadlines?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No upcoming deadlines this week
            </p>
          ) : (
            upcomingDeadlines?.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex-shrink-0">
                  {item.type === 'task' ? (
                    <Clock className="h-4 w-4 text-blue-500" />
                  ) : (
                    <FolderOpen className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.due_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
