
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, CheckSquare, Clock, TrendingUp } from 'lucide-react';
import { ProjectMilestonesPanel } from './ProjectMilestonesPanel';
import { RecentTasksList } from './RecentTasksList';
import { ProjectContractCard } from './ProjectContractCard';
import { ProjectDocumentsCard } from './ProjectDocumentsCard';

interface ProjectOverviewTabProps {
  project: any;
  assignees: any[];
  milestones: any[];
  tasks: any[];
  projectId: string;
  onCreateTask: () => void;
  onTaskClick: (taskId: string) => void;
}

export const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({
  project,
  assignees,
  milestones,
  tasks,
  projectId,
  onCreateTask,
  onTaskClick
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getProjectProgress = () => {
    if (!milestones || milestones.length === 0) return 0;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    return Math.round((completedMilestones / milestones.length) * 100);
  };

  const getTaskStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const todoTasks = tasks.filter(t => t.status === 'todo').length;
    
    return { totalTasks, completedTasks, inProgressTasks, todoTasks };
  };

  const taskStats = getTaskStats();
  const progress = getProjectProgress();

  return (
    <div className="space-y-6">
      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress}%</div>
            <p className="text-xs text-muted-foreground">
              {milestones.filter(m => m.status === 'completed').length} of {milestones.length} milestones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignees.length}</div>
            <p className="text-xs text-muted-foreground">
              assigned to project
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.inProgressTasks + taskStats.todoTasks}</div>
            <p className="text-xs text-muted-foreground">
              {taskStats.completedTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deadline</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatDate(project.deadline)}</div>
            <p className="text-xs text-muted-foreground">
              project deadline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Description</h4>
                <p className="text-sm text-gray-600">
                  {project.description || 'No description provided'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">Value</h4>
                  <p className="text-sm">
                    {project.value ? `$${project.value.toLocaleString()}` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Price Type</h4>
                  <p className="text-sm">{project.price_type || 'Not specified'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-1">Created</h4>
                <p className="text-sm">{formatDate(project.created_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectMilestonesPanel 
                projectId={projectId} 
                milestones={milestones} 
                compact={true} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentTasksList
                tasks={tasks}
                onTaskClick={onTaskClick}
                onCreateTask={onCreateTask}
              />
            </CardContent>
          </Card>

          {/* Project Contract */}
          <ProjectContractCard 
            projectId={projectId} 
            companyId={project.company_id}
            projectName={project.name}
          />

          {/* Documents */}
          <ProjectDocumentsCard projectId={projectId} />
        </div>
      </div>
    </div>
  );
};
