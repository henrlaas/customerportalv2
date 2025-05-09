
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Project, Milestone, User } from '@/types/project';
import MilestoneList from './MilestoneList';
import { useProjectTimeData } from '@/hooks/useProjectTimeData';

// UI components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarIcon,
  Clock,
  Building,
  Users,
  Banknote,
  FileText,
  Briefcase,
  ChevronRight,
  Timer,
  Edit,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProjectDetailsProps {
  project: Project & {
    company: {
      name: string;
      organization_number?: string;
      address?: string;
      postal_code?: string;
      city?: string;
      country?: string;
    };
    creator: User;
  };
  milestones: Milestone[] | undefined;
  isLoadingMilestones: boolean;
  onCreateMilestone: (data: { name: string; due_date?: string }) => void;
  onUpdateMilestoneStatus: (id: string, status: 'created' | 'completed') => void;
  assignees: Array<{
    id: string;
    user: User;
  }> | undefined;
  canEdit: boolean;
  contract?: {
    id: string;
    title: string;
    status: 'signed' | 'unsigned';
  } | null;
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
  }> | null;
  onEditProject: () => void;
}

export default function ProjectDetails({
  project,
  milestones,
  isLoadingMilestones,
  onCreateMilestone,
  onUpdateMilestoneStatus,
  assignees,
  canEdit,
  contract,
  tasks,
  onEditProject,
}: ProjectDetailsProps) {
  const { timeData, isLoading: isLoadingTimeData } = useProjectTimeData(project.id);
  const [completedPercentage, setCompletedPercentage] = useState(0);
  
  // Calculate completion percentage based on milestones
  useEffect(() => {
    if (milestones && milestones.length > 0) {
      const completed = milestones.filter(m => m.status === 'completed').length;
      setCompletedPercentage(Math.round((completed / milestones.length) * 100));
    }
  }, [milestones]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <div className="flex items-center text-muted-foreground mt-1">
            <Building className="h-4 w-4 mr-1" />
            {project.company.name}
          </div>
        </div>
        
        {canEdit && (
          <Button onClick={onEditProject} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {project.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                  <p className="text-sm">{project.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.deadline && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Deadline</h3>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(new Date(project.deadline), 'MMMM d, yyyy')}
                    </div>
                  </div>
                )}
                
                {project.value !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Value</h3>
                    <div className="flex items-center">
                      <Banknote className="h-4 w-4 mr-2" />
                      {new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK' }).format(project.value)}
                      {project.price_type && (
                        <Badge className="ml-2" variant="outline">
                          {project.price_type === 'fixed' ? 'Fixed Price' : 'Estimated'}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {format(new Date(project.created_at), 'MMMM d, yyyy')}
                  </div>
                </div>
                
                {contract && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Contract</h3>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="truncate mr-2">{contract.title}</span>
                      <Badge variant={contract.status === 'signed' ? 'default' : 'outline'}>
                        {contract.status === 'signed' ? 'Signed' : 'Unsigned'}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Project Progress */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Project Progress</h3>
                  <span className="text-sm font-medium">{completedPercentage}%</span>
                </div>
                <Progress value={completedPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs for Tasks and Time Tracking */}
          <Tabs defaultValue="milestones">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="timeTracking">Time Tracking</TabsTrigger>
            </TabsList>
            
            <TabsContent value="milestones">
              <MilestoneList 
                projectId={project.id}
                milestones={milestones}
                isLoading={isLoadingMilestones}
                onCreateMilestone={onCreateMilestone}
                onUpdateMilestoneStatus={onUpdateMilestoneStatus}
                readOnly={!canEdit}
              />
            </TabsContent>
            
            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Related Tasks</CardTitle>
                    {canEdit && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/tasks?projectId=${project.id}`}>
                          Manage Tasks
                        </a>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!tasks || tasks.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No tasks have been created for this project yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div 
                          key={task.id} 
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-3" />
                            <span className="font-medium">{task.title}</span>
                            <Badge className="ml-2" variant={task.status === 'done' ? 'default' : 'outline'}>
                              {task.status}
                            </Badge>
                            <Badge className="ml-2" variant="outline">
                              {task.priority}
                            </Badge>
                          </div>
                          <a href={`/tasks/${task.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="timeTracking">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Time Tracking</CardTitle>
                    {canEdit && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/time-tracking?projectId=${project.id}`}>
                          Track Time
                        </a>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingTimeData ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <Card className="bg-muted">
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                              {timeData?.totalHours.toFixed(1) || "0"}
                            </div>
                            <p className="text-xs text-muted-foreground">Total Hours</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted">
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                              {timeData?.billableHours.toFixed(1) || "0"}
                            </div>
                            <p className="text-xs text-muted-foreground">Billable Hours</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted">
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                              {timeData?.nonBillableHours.toFixed(1) || "0"}
                            </div>
                            <p className="text-xs text-muted-foreground">Non-Billable</p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {timeData?.profitability && project.value && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Project Profitability</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Value</div>
                                <div className="font-medium">
                                  {new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK' }).format(timeData.profitability.value)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Cost</div>
                                <div className="font-medium">
                                  {new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK' }).format(timeData.profitability.cost)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Profit</div>
                                <div className={`font-medium ${timeData.profitability.profit < 0 ? 'text-destructive' : 'text-green-600'}`}>
                                  {new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK' }).format(timeData.profitability.profit)}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Profit Margin</div>
                                <div className={`font-medium ${timeData.profitability.profitMargin < 0 ? 'text-destructive' : 'text-green-600'}`}>
                                  {timeData.profitability.profitMargin.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              {!assignees || assignees.length === 0 ? (
                <div className="text-center py-2 text-muted-foreground text-sm">
                  No team members assigned
                </div>
              ) : (
                <div className="space-y-3">
                  {assignees.map((assignee) => (
                    <div key={assignee.id} className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage 
                          src={assignee.user.avatar_url || undefined} 
                          alt={assignee.user.first_name || "User"} 
                        />
                        <AvatarFallback>
                          {assignee.user.first_name ? assignee.user.first_name[0] : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {assignee.user.first_name} {assignee.user.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {assignee.user.role || "User"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Time Tracking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Timer className="h-4 w-4 mr-2" />
                    <span>Total Hours</span>
                  </div>
                  <span className="font-medium">
                    {isLoadingTimeData ? "..." : (timeData?.totalHours.toFixed(1) || "0")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Banknote className="h-4 w-4 mr-2" />
                    <span>Project Value</span>
                  </div>
                  <span className="font-medium">
                    {project.value ? new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK' }).format(project.value) : "N/A"}
                  </span>
                </div>
                {timeData?.profitability && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Profitability</span>
                    </div>
                    <span className={`font-medium ${timeData.profitability.profitMargin < 0 ? 'text-destructive' : 'text-green-600'}`}>
                      {timeData.profitability.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
