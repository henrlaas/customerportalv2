
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { useMilestones } from '@/hooks/useMilestones';
import { useProjectTimeData } from '@/hooks/useProjectTimeData';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/components/Deals/utils/formatters';
import { MilestoneList } from './MilestoneList';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Building,
  Calendar,
  Clock,
  FileText,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Project } from '@/types/project';

export const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { isAdmin, isEmployee } = useAuth();
  const { getProjectById } = useProjects();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { milestones, isLoading: milestonesLoading, createMilestone, updateMilestoneStatus } = useMilestones(projectId);
  const { data: timeData, isLoading: timeDataLoading } = useProjectTimeData(projectId);

  useEffect(() => {
    const loadProject = async () => {
      try {
        if (projectId) {
          const projectData = await getProjectById(projectId);
          setProject(projectData);
        }
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, getProjectById]);

  const handleBackClick = () => {
    navigate('/projects');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-gray-500 mb-4">Project not found</p>
        <Button onClick={handleBackClick}>Go Back to Projects</Button>
      </div>
    );
  }

  const canEdit = isAdmin || isEmployee;

  return (
    <div className="container p-6 mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleBackClick} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold">{project.name}</CardTitle>
                  <CardDescription className="mt-1">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{project.company?.name || 'No company'}</span>
                    </div>
                  </CardDescription>
                </div>
                {project.price_type && (
                  <Badge className="ml-2">
                    {project.price_type === 'fixed' ? 'Fixed Price' : 'Estimated Price'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-700">{project.description || 'No description provided.'}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Project Details</h3>
                    <div className="space-y-2">
                      {project.value && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">Value: {formatCurrency(project.value)}</span>
                        </div>
                      )}
                      {project.deadline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">Deadline: {format(new Date(project.deadline), 'PPP')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">Created: {format(new Date(project.created_at), 'PPP')}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Team</h3>
                    <div className="flex flex-col space-y-2">
                      {project.assignees && project.assignees.length > 0 ? (
                        project.assignees.map((assignee) => (
                          <div key={assignee.id} className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={assignee.avatar_url || undefined} />
                              <AvatarFallback>
                                {assignee.first_name?.[0]}{assignee.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {assignee.first_name} {assignee.last_name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No team members assigned</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="milestones" className="mt-6">
            <TabsList>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="time">Time Tracking</TabsTrigger>
            </TabsList>
            <TabsContent value="milestones" className="mt-4">
              <MilestoneList
                projectId={project.id}
                milestones={milestones}
                isLoading={milestonesLoading}
                onCreateMilestone={createMilestone}
                onUpdateStatus={updateMilestoneStatus}
              />
            </TabsContent>
            <TabsContent value="time" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Time Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  {timeDataLoading ? (
                    <p>Loading time data...</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Total Hours</p>
                        <p className="text-2xl font-bold">{timeData?.totalHours.toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Billable Hours</p>
                        <p className="text-2xl font-bold">{timeData?.billableHours.toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Non-Billable Hours</p>
                        <p className="text-2xl font-bold">{timeData?.nonBillableHours.toFixed(2)}</p>
                      </div>
                      {timeData?.profitability !== undefined && (
                        <div className="md:col-span-3 bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Profitability</p>
                          <p className={`text-2xl font-bold ${timeData.profitability >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(timeData.profitability)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Milestones Completed</p>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${milestones.length > 0 
                            ? (milestones.filter(m => m.status === 'completed').length / milestones.length) * 100 
                            : 0}%` 
                        }} 
                      />
                    </div>
                    <span className="ml-2 text-sm">
                      {milestones.filter(m => m.status === 'completed').length}/{milestones.length}
                    </span>
                  </div>
                </div>
                
                {project.deadline && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Time Remaining</p>
                    <p className="text-lg font-medium mt-1">
                      {new Date(project.deadline) > new Date() 
                        ? `${Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`
                        : 'Past deadline'}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Created By</p>
                  <div className="flex items-center mt-1">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={project.creator?.avatar_url || undefined} />
                      <AvatarFallback>
                        {project.creator?.first_name?.[0]}{project.creator?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {project.creator?.first_name} {project.creator?.last_name}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              {/* This would be populated when we implement the contracts feature */}
              <p className="text-sm text-gray-500">Contract details will appear here once available.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
