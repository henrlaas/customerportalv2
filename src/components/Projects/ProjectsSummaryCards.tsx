
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText, CheckSquare, Clock, DollarSign } from 'lucide-react';
import { ProjectWithRelations } from '@/hooks/useProjects';

interface ProjectsSummaryCardsProps {
  projects: ProjectWithRelations[] | undefined;
  isLoading: boolean;
}

export const ProjectsSummaryCards: React.FC<ProjectsSummaryCardsProps> = ({
  projects = [],
  isLoading
}) => {
  // Calculate summary data
  const totalProjects = projects.length;
  
  // Currently there's no "signed" state in the project type, so we'll calculate based on contracts later
  const totalSignedProjects = 0;
  const totalUnsignedProjects = totalProjects - totalSignedProjects;
  
  // Calculate total value of all projects
  const totalProjectsValue = projects.reduce((sum, project) => sum + (project.value || 0), 0);
  
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
          <div className="rounded-full bg-yellow-100 p-3 mr-4">
            <Clock className="h-6 w-6 text-yellow-700" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalUnsignedProjects}</div>
            <div className="text-muted-foreground">Unsigned Projects</div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-start">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <CheckSquare className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalSignedProjects}</div>
            <div className="text-muted-foreground">Signed Projects</div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-start">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <DollarSign className="h-6 w-6 text-purple-700" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalProjectsValue.toLocaleString()} NOK</div>
            <div className="text-muted-foreground">Total Value</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
