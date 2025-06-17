
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, PlayCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export function MyProjectsCard() {
  const { user } = useAuth();

  const { data: projectStats, isLoading } = useQuery({
    queryKey: ['my-project-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, inProgress: 0, completed: 0, overdue: 0 };

      // Get projects assigned to the current user
      const { data: assignedProjects, error } = await supabase
        .from('project_assignees')
        .select(`
          project_id,
          projects!inner(
            id,
            deadline,
            milestones(status)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const total = assignedProjects?.length || 0;
      const today = new Date();
      
      let inProgress = 0;
      let completed = 0;
      let overdue = 0;

      assignedProjects?.forEach(ap => {
        const project = ap.projects;
        const milestones = project.milestones || [];
        
        // Check if project is completed (all milestones completed)
        const allMilestonesCompleted = milestones.length > 0 && 
          milestones.every(m => m.status === 'completed');
        
        // Check if project is overdue
        const isOverdue = project.deadline && 
          new Date(project.deadline) < today && 
          !allMilestonesCompleted;
        
        if (allMilestonesCompleted) {
          completed++;
        } else if (isOverdue) {
          overdue++;
        } else {
          inProgress++;
        }
      });

      return { total, inProgress, completed, overdue };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-28"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-indigo-600" />
          My Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Total Projects</span>
          </div>
          <span className="font-semibold text-lg">{projectStats?.total || 0}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <span className="font-semibold text-lg text-blue-600">{projectStats?.inProgress || 0}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <span className="font-semibold text-lg text-green-600">{projectStats?.completed || 0}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-gray-600">Overdue</span>
          </div>
          <span className="font-semibold text-lg text-red-600">{projectStats?.overdue || 0}</span>
        </div>
      </CardContent>
    </Card>
  );
}
