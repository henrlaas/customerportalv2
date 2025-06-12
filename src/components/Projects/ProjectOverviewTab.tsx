import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar, DollarSign, FileText, Users, Eye } from 'lucide-react';
import { CompanyFavicon } from '@/components/CompanyFavicon';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { TaskSummaryCards } from './TaskSummaryCards';
import { ProjectFinanceCard } from './ProjectFinanceCard';
import { RecentTasksList } from './RecentTasksList';
import { ProjectMilestonesPanel } from './ProjectMilestonesPanel';
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
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Not specified';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatPriceType = (priceType: string | null) => {
    if (!priceType) return 'Not specified';
    return priceType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side - Main content (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Task Summary */}
        <TaskSummaryCards tasks={tasks} />
        
        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Project Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectMilestonesPanel 
              projectId={projectId} 
              milestones={milestones}
              compact={true}
            />
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTasksList 
              tasks={tasks} 
              onTaskClick={onTaskClick}
              onCreateTask={onCreateTask}
            />
          </CardContent>
        </Card>

        {/* Finance Overview */}
        <ProjectFinanceCard projectId={projectId} projectValue={project?.value} />
      </div>

      {/* Right side - Info cards (1/3 width) */}
      <div className="space-y-6">
        {/* Project Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Company */}
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-blue-600 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Company</p>
                <div className="flex items-center gap-2">
                  {project?.company && (
                    <CompanyFavicon 
                      companyName={project.company.name} 
                      website={project.company.website}
                      size="sm"
                    />
                  )}
                  <span className="text-sm font-medium">{project?.company?.name || 'Not assigned'}</span>
                </div>
              </div>
            </div>

            {/* Project Value */}
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-green-600 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Value</p>
                <p className="text-sm font-medium">{formatCurrency(project?.value)}</p>
              </div>
            </div>

            {/* Price Type */}
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-purple-600 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Price Type</p>
                <Badge variant="outline" className="text-xs">
                  {formatPriceType(project?.price_type)}
                </Badge>
              </div>
            </div>

            {/* Team Members */}
            <div className="flex items-start gap-3">
              <Users className="h-4 w-4 text-indigo-600 shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Team Members</p>
                {assignees && assignees.length > 0 ? (
                  <div className="mt-1">
                    <UserAvatarGroup
                      users={assignees.map(assignee => ({
                        id: assignee.user_id,
                        first_name: assignee.profiles?.first_name,
                        last_name: assignee.profiles?.last_name,
                        avatar_url: assignee.profiles?.avatar_url
                      }))}
                      size="sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {assignees.length} {assignees.length === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No members assigned</p>
                )}
              </div>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-red-600 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Deadline</p>
                <p className="text-sm">{formatDate(project?.deadline)}</p>
              </div>
            </div>

            {/* Description */}
            {project?.description && (
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Description</p>
                  <Dialog open={isDescriptionDialogOpen} onOpenChange={setIsDescriptionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-0 justify-start text-left">
                        <Eye className="h-3 w-3 mr-1" />
                        View Description
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Project Description</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {project.description}
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Contract Card */}
        <ProjectContractCard projectId={projectId} companyId={project?.company_id} />

        {/* Documents Card */}
        <ProjectDocumentsCard projectId={projectId} />
      </div>
    </div>
  );
};
