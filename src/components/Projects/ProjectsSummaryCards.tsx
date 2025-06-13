
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText, CheckSquare, Clock, DollarSign } from 'lucide-react';
import { ProjectWithRelations } from '@/hooks/useProjects';
import { getProjectStatus } from '@/utils/projectStatus';

interface ProjectsSummaryCardsProps {
  projects: ProjectWithRelations[] | undefined;
  isLoading: boolean;
  projectMilestones?: Record<string, any[]>;
}

export const ProjectsSummaryCards: React.FC<ProjectsSummaryCardsProps> = ({
  projects = [],
  isLoading,
  projectMilestones = {}
}) => {
  // Calculate summary data
  const totalProjects = projects.length;
  
  // Calculate in progress and completed projects based on milestones
  let inProgressProjects = 0;
  let completedProjects = 0;
  let totalCompletedValue = 0;
  
  projects.forEach(project => {
    const milestones = projectMilestones[project.id] || [];
    const status = getProjectStatus(milestones);
    
    if (status === 'completed') {
      completedProjects += 1;
      totalCompletedValue += project.value || 0;
    } else {
      inProgressProjects += 1;
    }
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2 w-1/4"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-6">
        <div className="flex items-start">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <FileText className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <div className="text-muted-foreground">Total Projects</div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-start">
          <div className="rounded-full bg-orange-100 p-3 mr-4">
            <Clock className="h-6 w-6 text-orange-700" />
          </div>
          <div>
            <div className="text-2xl font-bold">{inProgressProjects}</div>
            <div className="text-muted-foreground">In Progress Projects</div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-start">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <CheckSquare className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <div className="text-2xl font-bold">{completedProjects}</div>
            <div className="text-muted-foreground">Completed Projects</div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-start">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <DollarSign className="h-6 w-6 text-purple-700" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalCompletedValue.toLocaleString()} NOK</div>
            <div className="text-muted-foreground">Total Completed Value</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
