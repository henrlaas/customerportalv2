
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
          <Card key={i} className="animate-pulse bg-gray-50 border">
            <CardContent className="p-4">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-blue-50 text-blue-700 border-blue-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Total Projects</p>
              <p className="text-2xl font-bold mt-1">{totalProjects}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-orange-50 text-orange-700 border-orange-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">In Progress Projects</p>
              <p className="text-2xl font-bold mt-1">{inProgressProjects}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-green-50 text-green-700 border-green-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Completed Projects</p>
              <p className="text-2xl font-bold mt-1">{completedProjects}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-purple-50 text-purple-700 border-purple-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Total Completed Value</p>
              <p className="text-2xl font-bold mt-1">{totalCompletedValue.toLocaleString()} NOK</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
