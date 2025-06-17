
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { Calendar, Clock, FolderOpen, CheckSquare } from 'lucide-react';

interface DeadlineItem {
  id: string;
  title: string;
  type: 'task' | 'project';
  date: string;
  status?: string;
}

export function UpcomingDeadlinesCalendar() {
  const { user } = useAuth();

  const { data: deadlines = [], isLoading } = useQuery({
    queryKey: ['upcoming-deadlines', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const today = new Date();
      const weekEnd = addDays(today, 7);

      const deadlineItems: DeadlineItem[] = [];

      // Get tasks with deadlines in the next week
      const { data: taskAssignees, error: tasksError } = await supabase
        .from('task_assignees')
        .select(`
          tasks!inner(
            id,
            title,
            due_date,
            status
          )
        `)
        .eq('user_id', user.id);

      if (tasksError) console.error('Tasks error:', tasksError);

      if (taskAssignees) {
        taskAssignees.forEach(ta => {
          const task = ta.tasks;
          if (task.due_date) {
            const dueDate = new Date(task.due_date);
            if (dueDate >= today && dueDate <= weekEnd) {
              deadlineItems.push({
                id: task.id,
                title: task.title,
                type: 'task',
                date: task.due_date,
                status: task.status
              });
            }
          }
        });
      }

      // Get projects with deadlines in the next week
      const { data: projectAssignees, error: projectsError } = await supabase
        .from('project_assignees')
        .select(`
          projects!inner(
            id,
            name,
            deadline
          )
        `)
        .eq('user_id', user.id);

      if (projectsError) console.error('Projects error:', projectsError);

      if (projectAssignees) {
        projectAssignees.forEach(pa => {
          const project = pa.projects;
          if (project.deadline) {
            const deadline = new Date(project.deadline);
            if (deadline >= today && deadline <= weekEnd) {
              deadlineItems.push({
                id: project.id,
                title: project.name,
                type: 'project',
                date: project.deadline
              });
            }
          }
        });
      }

      // Sort by date
      return deadlineItems.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    },
    enabled: !!user?.id,
  });

  // Group deadlines by date
  const groupedDeadlines = deadlines.reduce((acc, deadline) => {
    const dateKey = format(parseISO(deadline.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(deadline);
    return acc;
  }, {} as Record<string, DeadlineItem[]>);

  // Generate next 7 days
  const today = new Date();
  const nextSevenDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg">Upcoming Deadlines</h2>
        </div>
        <div className="flex-1 p-4 space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Deadlines
        </h2>
        <p className="text-sm text-gray-600 mt-1">Next 7 days</p>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-y-auto">
        {nextSevenDays.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayDeadlines = groupedDeadlines[dateKey] || [];
          const isToday = isSameDay(day, today);

          return (
            <div key={dateKey} className="border-b border-gray-100 last:border-b-0">
              {/* Date Header */}
              <div className={`p-3 bg-gray-50 border-b border-gray-100 ${isToday ? 'bg-blue-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-medium text-sm ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                    {format(day, 'EEE, MMM d')}
                  </span>
                  {isToday && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Today
                    </span>
                  )}
                </div>
              </div>

              {/* Deadlines for this day */}
              <div className="p-3 space-y-2">
                {dayDeadlines.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No deadlines</p>
                ) : (
                  dayDeadlines.map(deadline => (
                    <div
                      key={`${deadline.type}-${deadline.id}`}
                      className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {deadline.type === 'task' ? (
                          <CheckSquare className={`h-4 w-4 ${
                            deadline.status === 'completed' ? 'text-green-500' : 'text-blue-500'
                          }`} />
                        ) : (
                          <FolderOpen className="h-4 w-4 text-purple-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {deadline.title}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {deadline.type}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
