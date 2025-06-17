
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

export const MyProjectsCard = () => {
  const { user } = useAuth();

  const { data: projectStats, isLoading } = useQuery({
    queryKey: ['user-project-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { active: 0, completed: 0, overdue: 0 };

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
        return { active: 0, completed: 0, overdue: 0 };
      }

      const userProjects = projectAssignees.map(pa => pa.projects).filter(Boolean);
      const now = new Date();

      let active = 0;
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
            active++;
          } else if (completedMilestones === totalMilestones) {
            completed++;
          } else {
            active++;
          }

          // Check if overdue
          if (project.deadline && new Date(project.deadline) < now && completedMilestones < totalMilestones) {
            overdue++;
          }
        });
      }

      return { active, completed, overdue };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="h-full bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
            <FolderOpen className="h-5 w-5" />
            My Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground animate-pulse">
            <div className="h-12 bg-orange-200 rounded-lg mb-4"></div>
            <div className="h-16 bg-orange-200 rounded mb-2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = projectStats || { active: 0, completed: 0, overdue: 0 };

  return (
    <Card className="h-full bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100 hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
          <FolderOpen className="h-5 w-5" />
          My Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hero Section */}
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-600 mb-1">{stats.active}</div>
          <div className="text-sm text-orange-600/70 font-medium">Active Projects</div>
        </div>

        {/* Project Status Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-white/60 rounded-lg p-3">
            <div className="text-xl font-semibold text-green-600">{stats.completed}</div>
            <div className="text-xs text-green-600/70">Completed</div>
          </div>
          <div className="text-center bg-white/60 rounded-lg p-3">
            <div className="text-xl font-semibold text-red-600">{stats.overdue}</div>
            <div className="text-xs text-red-600/70">Overdue</div>
          </div>
        </div>

        {/* Status Indicator */}
        {stats.overdue > 0 ? (
          <div className="flex items-center justify-center gap-2 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Attention needed</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-orange-600">
            <Activity className="h-4 w-4" />
            <span>All on track</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
