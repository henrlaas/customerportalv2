
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Clock, CheckCircle, AlertTriangle, Target } from 'lucide-react';

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
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            My Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-16"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = projectStats || { total: 0, inProgress: 0, completed: 0, overdue: 0 };
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            My Projects
          </div>
          {stats.overdue > 0 && (
            <Badge variant="destructive" className="text-xs">
              {stats.overdue} overdue
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hero Metric */}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-1">
            {stats.inProgress}
          </div>
          <div className="text-sm text-muted-foreground">Active Projects</div>
        </div>

        {/* Completion Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Supporting Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Total</span>
            </div>
            <div className="text-lg font-bold text-blue-700">{stats.total}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Done</span>
            </div>
            <div className="text-lg font-bold text-green-700">{stats.completed}</div>
          </div>
        </div>

        {/* Status Insights */}
        <div className="space-y-2 pt-1">
          {stats.inProgress > 0 && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Clock className="h-3 w-3" />
              <span>{stats.inProgress} projects active</span>
            </div>
          )}
          {stats.overdue > 0 && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle className="h-3 w-3" />
              <span>{stats.overdue} projects overdue</span>
            </div>
          )}
          {stats.inProgress === 0 && stats.total > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>All projects completed! 🎉</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
