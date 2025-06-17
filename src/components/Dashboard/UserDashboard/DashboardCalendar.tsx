
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckSquare, FolderOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, addDays, parseISO, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const DashboardCalendar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get next 7 days
  const nextWeekDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const { data: upcomingDeadlines, isLoading } = useQuery({
    queryKey: ['upcoming-deadlines', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const weekStart = new Date();
      const weekEnd = addDays(new Date(), 7);

      // Get user's tasks with due dates in the next week
      const { data: userTasks, error: tasksError } = await supabase
        .from('task_assignees')
        .select(`
          tasks (
            id,
            title,
            due_date,
            priority,
            status
          )
        `)
        .eq('user_id', user.id);

      if (tasksError) console.error('Error fetching tasks:', tasksError);

      // Get user's projects with deadlines in the next week
      const { data: userProjects, error: projectsError } = await supabase
        .from('project_assignees')
        .select(`
          projects (
            id,
            name,
            deadline
          )
        `)
        .eq('user_id', user.id);

      if (projectsError) console.error('Error fetching projects:', projectsError);

      const tasks = userTasks?.map(ta => ta.tasks).filter(t => 
        t && t.due_date && 
        new Date(t.due_date) >= weekStart && 
        new Date(t.due_date) <= weekEnd
      ) || [];

      const projects = userProjects?.map(pa => pa.projects).filter(p => 
        p && p.deadline && 
        new Date(p.deadline) >= weekStart && 
        new Date(p.deadline) <= weekEnd
      ) || [];

      return [...tasks, ...projects];
    },
    enabled: !!user?.id,
  });

  const getItemsForDate = (date: Date) => {
    if (!upcomingDeadlines) return [];
    
    return upcomingDeadlines.filter(item => {
      const itemDate = item.due_date ? parseISO(item.due_date) : item.deadline ? parseISO(item.deadline) : null;
      return itemDate && isSameDay(itemDate, date);
    });
  };

  const handleItemClick = (item: any) => {
    if (item.title) {
      // It's a task
      navigate(`/tasks`);
    } else {
      // It's a project
      navigate(`/projects/${item.id}`);
    }
  };

  return (
    <Card className="bg-white h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="text-center text-gray-500 py-4">Loading...</div>
        ) : (
          <div className="space-y-3">
            {nextWeekDays.map((date, index) => {
              const items = getItemsForDate(date);
              const isToday = isSameDay(date, new Date());
              
              return (
                <div key={index} className={`p-2 rounded-lg border ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`text-sm font-medium ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                    {format(date, 'EEE, MMM d')}
                  </div>
                  {items.length > 0 ? (
                    <div className="mt-1 space-y-1">
                      {items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          onClick={() => handleItemClick(item)}
                          className="flex items-center gap-1 text-xs cursor-pointer hover:bg-white hover:bg-opacity-70 p-1 rounded transition-colors"
                        >
                          {item.title ? (
                            <>
                              <CheckSquare className="h-3 w-3 text-blue-500 flex-shrink-0" />
                              <span className="truncate">{item.title}</span>
                            </>
                          ) : (
                            <>
                              <FolderOpen className="h-3 w-3 text-indigo-500 flex-shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 mt-1">No deadlines</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
