
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export const MyProjectsCard = () => {
  const { user } = useAuth();

  const { data: projectStats, isLoading } = useQuery({
    queryKey: ['user-project-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, inProgress: 0, completed: 0, overdue: 0 };

      // Get projects assigned to the current user
      const { data: projectAssignees, error } = await supabase
        .from('project_assignees')
        .select(`
          project_id,
          projects (
            id,
            deadline
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (!projectAssignees) {
        return { total: 0, inProgress: 0, completed: 0, overdue: 0 };
      }

      const userProjects = projectAssignees.map(pa => pa.projects).filter(Boolean);
      const total = userProjects.length;
      const now = new Date();

      let inProgress = 0;
      let completed = 0;
      let overdue = 0;

      // Get milestones for each project
      const projectIds = userProjects.map(p => p.id);
      
      if (projectIds.length > 0) {
        const { data: milestones, error: milestonesError } = await supabase
          .from('milestones')
          .select('project_id, status')
          .in('project_id', projectIds);

        if (milestonesError) throw milestonesError;

        userProjects.forEach(project => {
          const projectMilestones = milestones?.filter(m => m.project_id === project.id) || [];
          const completedMilestones = projectMilestones.filter(m => m.status === 'completed').length;
          const totalMilestones = projectMilestones.length;

          // Determine project status based on milestones
          if (totalMilestones === 0) {
            inProgress++;
          } else if (completedMilestones === totalMilestones) {
            completed++;
          } else {
            inProgress++;
          }

          // Check if overdue
          if (project.deadline && new Date(project.deadline) < now && completedMilestones < totalMilestones) {
            overdue++;
          }
        });
      } else {
        // If no projects, all counts remain 0
        inProgress = total;
      }

      return { total, inProgress, completed, overdue };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            My Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const stats = projectStats || { total: 0, inProgress: 0, completed: 0, overdue: 0 };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          My Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>{stats.inProgress} projects active</span>
          </div>
          {stats.overdue > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>{stats.overdue} projects overdue</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
