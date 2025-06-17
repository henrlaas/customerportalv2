
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FolderOpen, Play, CheckCircle, AlertCircle } from 'lucide-react';

export const MyProjectsCard = () => {
  const { user } = useAuth();

  const { data: projectStats, isLoading } = useQuery({
    queryKey: ['user-project-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, inProgress: 0, completed: 0, overdue: 0 };

      // Get projects assigned to the current user
      const { data: userProjects, error } = await supabase
        .from('project_assignees')
        .select(`
          project_id,
          projects (
            id,
            deadline,
            milestones (
              id,
              status
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const projects = userProjects?.map(pa => pa.projects).filter(Boolean) || [];
      const total = projects.length;
      
      let inProgress = 0;
      let completed = 0;
      let overdue = 0;
      const now = new Date();

      projects.forEach(project => {
        const milestones = project.milestones || [];
        const hasCompletedMilestones = milestones.some(m => m.status === 'completed');
        const allMilestonesCompleted = milestones.length > 0 && milestones.every(m => m.status === 'completed');
        
        if (allMilestonesCompleted) {
          completed++;
        } else if (hasCompletedMilestones || milestones.some(m => m.status === 'in_progress')) {
          inProgress++;
        }
        
        // Check if project is overdue
        if (project.deadline && new Date(project.deadline) < now && !allMilestonesCompleted) {
          overdue++;
        }
      });

      return { total, inProgress, completed, overdue };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            My Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          My Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Projects</span>
            <span className="text-2xl font-bold">{projectStats?.total || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-blue-500" />
              <span className="text-sm">In Progress</span>
            </div>
            <span className="text-lg font-semibold text-blue-600">{projectStats?.inProgress || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Completed</span>
            </div>
            <span className="text-lg font-semibold text-green-600">{projectStats?.completed || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Overdue</span>
            </div>
            <span className="text-lg font-semibold text-red-600">{projectStats?.overdue || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
