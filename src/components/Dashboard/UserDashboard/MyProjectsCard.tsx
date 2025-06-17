
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const MyProjectsCard = () => {
  const { user } = useAuth();

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['my-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, inProgress: 0, completed: 0, overdue: 0 };

      // Get user's assigned projects
      const { data: assignedProjects, error } = await supabase
        .from('project_assignees')
        .select(`
          project_id,
          projects (
            id,
            name,
            deadline,
            milestones (
              id,
              status
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const projects = assignedProjects?.map(pa => pa.projects).filter(Boolean) || [];
      const total = projects.length;
      
      let inProgress = 0;
      let completed = 0;
      let overdue = 0;
      const now = new Date();

      projects.forEach(project => {
        const milestones = project.milestones || [];
        const totalMilestones = milestones.length;
        const completedMilestones = milestones.filter(m => m.status === 'completed').length;
        
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

      return { total, inProgress, completed, overdue };
    },
    enabled: !!user?.id,
  });

  const stats = projectsData || { total: 0, inProgress: 0, completed: 0, overdue: 0 };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-indigo-600" />
          My Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : stats.total}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? '...' : stats.inProgress}
            </div>
            <div className="text-xs text-gray-500">In Progress</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t pt-3">
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {isLoading ? '...' : stats.completed}
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-600">
              {isLoading ? '...' : stats.overdue}
            </div>
            <div className="text-xs text-gray-500">Overdue</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
