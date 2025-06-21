
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, CheckCircle, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { useRealtimeMilestones } from '@/hooks/realtime/useRealtimeMilestones';
import { useRealtimeProjects } from '@/hooks/realtime/useRealtimeProjects';

export const MyProjectsCard = () => {
  const { user } = useAuth();

  // Enable real-time updates for projects and milestones
  useRealtimeProjects({ enabled: !!user?.id });
  useRealtimeMilestones({ enabled: !!user?.id });

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
      <Card className="h-full border-l-4 border-l-[#004743]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-[#004743]" />
            My Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="bg-gray-200 h-16 rounded-lg"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-200 h-12 rounded-lg"></div>
              <div className="bg-gray-200 h-12 rounded-lg"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = projectStats || { active: 0, completed: 0, overdue: 0 };
  const totalProjects = stats.active + stats.completed;
  const isHealthy = stats.overdue === 0;
  const completionRate = totalProjects > 0 ? Math.round((stats.completed / totalProjects) * 100) : 0;

  return (
    <Card className="h-full border-l-4 border-l-[#004743] bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-[#004743]">
            <FolderOpen className="h-6 w-6 transition-transform group-hover:scale-110" />
            My Projects
          </CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isHealthy 
              ? 'bg-[#F2FCE2] text-[#004743]' 
              : 'bg-red-50 text-red-600'
          }`}>
            {isHealthy ? 'Healthy' : 'Needs Review'}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Active Projects Hero */}
        <div className="relative">
          <div className="text-center bg-gradient-to-br from-[#004743]/5 to-[#F2FCE2]/30 rounded-xl p-4 border border-[#F2FCE2]/50">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-[#004743] mr-2" />
              <div className="text-4xl font-bold text-[#004743]">{stats.active}</div>
            </div>
            <div className="text-sm text-gray-600 font-medium mb-3">Active Projects</div>
            
            {/* Project Health Indicator */}
            {totalProjects > 0 && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-[#004743] to-[#004743]/80 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {completionRate}% portfolio completion
                </div>
              </>
            )}
          </div>
        </div>

        {/* Project Status Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F2FCE2]/30 rounded-lg p-3 text-center border border-[#F2FCE2]/50 hover:bg-[#F2FCE2]/40 transition-colors">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-4 w-4 text-[#004743] mr-1" />
              <span className="text-xl font-bold text-[#004743]">{stats.completed}</span>
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          
          <div className={`rounded-lg p-3 text-center border transition-colors ${
            stats.overdue > 0 
              ? 'bg-red-50 border-red-200 hover:bg-red-100' 
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}>
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className={`h-4 w-4 mr-1 ${
                stats.overdue > 0 ? 'text-red-600' : 'text-gray-400'
              }`} />
              <span className={`text-xl font-bold ${
                stats.overdue > 0 ? 'text-red-600' : 'text-gray-400'
              }`}>{stats.overdue}</span>
            </div>
            <div className="text-xs text-gray-600">Overdue</div>
          </div>
        </div>

        {/* Project Health Summary */}
        <div className="bg-gradient-to-r from-[#F2FCE2]/20 to-[#F2FCE2]/10 rounded-lg p-3 border border-[#F2FCE2]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Project Health</span>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              stats.overdue === 0 ? 'bg-[#004743] text-white' :
              stats.overdue <= 2 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {stats.overdue === 0 ? 'Excellent' : 
               stats.overdue <= 2 ? 'Good' : 
               'Needs Attention'}
            </div>
          </div>
          
          <div className="text-xs text-gray-600">
            {stats.overdue === 0 ? 
              'All projects are on track and meeting deadlines' :
              `${stats.overdue} project${stats.overdue > 1 ? 's' : ''} require immediate attention`
            }
          </div>
        </div>

        {/* Status Footer */}
        <div className="flex items-center justify-center pt-2 border-t border-gray-100">
          {stats.overdue > 0 ? (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Review overdue projects</span>
            </div>
          ) : stats.active === 0 ? (
            <div className="flex items-center gap-2 text-sm text-[#004743]">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Ready for new projects! 🚀</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-[#004743]">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">All projects on track</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
