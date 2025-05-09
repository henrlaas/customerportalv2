
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ProjectWithRelations } from '@/types/project';
import { format } from 'date-fns';
import { formatCurrency } from '@/components/Deals/utils/formatters';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  Users,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { MilestoneList } from './MilestoneList';
import { useMilestones } from '@/hooks/useMilestones';
import { useProjectTimeData } from '@/hooks/useProjectTimeData';
import contractService from '@/services/contractService';
import { Skeleton } from '@/components/ui/skeleton';

export const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isEmployee } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);
  
  // Fetch project details
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          company:companies(*),
          creator:profiles!projects_created_by_fkey(*)
        `)
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      
      // Fetch project assignees
      const { data: assigneesData } = await supabase
        .from('project_assignees')
        .select('user_id')
        .eq('project_id', projectId);
      
      if (assigneesData && assigneesData.length > 0) {
        const userIds = assigneesData.map(a => a.user_id);
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);
        
        return { ...data, assignees: profilesData || [] };
      }
      
      return { ...data, assignees: [] };
    },
    enabled: !!projectId,
  });
  
  // Fetch task count
  const { data: taskCount = 0, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['project-tasks-count', projectId],
    queryFn: async () => {
      if (!projectId) return 0;
      
      const { count, error } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);
      
      if (error) throw error;
      
      return count || 0;
    },
    enabled: !!projectId,
  });
  
  // Fetch project contracts
  const { data: contracts = [], isLoading: isLoadingContracts } = useQuery({
    queryKey: ['project-contracts', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      
      return data;
    },
    enabled: !!projectId,
  });

  // Use milestones hook
  const {
    milestones,
    isLoading: isLoadingMilestones,
    createMilestone,
    updateMilestoneStatus,
  } = useMilestones(projectId);
  
  // Use time tracking data hook
  const {
    data: timeData,
    isLoading: isLoadingTimeData,
  } = useProjectTimeData(projectId);
  
  // Generate contract mutation
  const generateContractMutation = useMutation({
    mutationFn: async () => {
      if (!projectId || !user) throw new Error("Missing project ID or user");
      return contractService.createContractFromProject(projectId, user.id);
    },
    onSuccess: (contractId) => {
      queryClient.invalidateQueries({ queryKey: ['project-contracts', projectId] });
      toast({
        title: "Contract Generated",
        description: "The project contract has been generated successfully."
      });
      navigate(`/contracts?id=${contractId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate contract. Please try again.",
        variant: "destructive",
      });
      console.error("Contract generation error:", error);
    },
  });
  
  const handleGenerateContract = () => {
    setIsGeneratingContract(true);
    generateContractMutation.mutate();
  };
  
  const canEditProject = isAdmin || isEmployee;
  const hasContract = contracts.length > 0;
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="text-gray-500 mb-6">The project you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {canEditProject && !hasContract && (
            <Button
              onClick={handleGenerateContract}
              disabled={isGeneratingContract}
            >
              Generate Contract
            </Button>
          )}
          {hasContract && (
            <Button
              variant="outline"
              onClick={() => navigate(`/contracts?projectId=${projectId}`)}
            >
              View Contract
            </Button>
          )}
        </div>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        {project.company && (
          <div className="flex items-center mt-2 text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            <span>{project.company.name}</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1">{project.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {project.value !== null && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Budget</h3>
                  <p className="mt-1 flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-gray-400" />
                    {formatCurrency(project.value)}
                  </p>
                  {project.price_type && (
                    <Badge variant="outline" className="mt-1">
                      {project.price_type === 'fixed' ? 'Fixed Price' : 'Estimated Price'}
                    </Badge>
                  )}
                </div>
              )}
              
              {project.deadline && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Deadline</h3>
                  <p className="mt-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {format(new Date(project.deadline), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="mt-1 flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                {format(new Date(project.created_at), 'MMM dd, yyyy')}
              </p>
            </div>
            
            {project.assignees && project.assignees.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
                <div className="mt-2">
                  <UserAvatarGroup 
                    profiles={project.assignees.map(a => ({
                      id: a.id,
                      first_name: a.first_name || null,
                      last_name: a.last_name || null,
                      avatar_url: a.avatar_url || null
                    }))} 
                    showNames
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Time Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTimeData ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total Hours</h3>
                  <p className="text-2xl font-bold mt-1">
                    {timeData?.totalHours.toFixed(1) || '0.0'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Billable</h3>
                    <p className="text-lg font-medium mt-1">
                      {timeData?.billableHours.toFixed(1) || '0.0'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Non-Billable</h3>
                    <p className="text-lg font-medium mt-1">
                      {timeData?.nonBillableHours.toFixed(1) || '0.0'}
                    </p>
                  </div>
                </div>
                
                {timeData?.profitability !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Profitability</h3>
                    <p className={`text-lg font-medium mt-1 ${
                      timeData.profitability >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(timeData.profitability)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/time-tracking', { state: { projectId } })}
            >
              View Time Entries
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>
              {isLoadingTasks ? 
                'Loading tasks...' : 
                `${taskCount} task${taskCount !== 1 ? 's' : ''} associated with this project`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTasks ? (
              <Skeleton className="h-20 w-full" />
            ) : taskCount === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>No tasks yet</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-2xl font-bold">{taskCount}</p>
                <p className="text-gray-500">Tasks</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/tasks', { state: { projectId } })}
            >
              View Tasks
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <MilestoneList 
          projectId={projectId || ''}
          milestones={milestones}
          isLoading={isLoadingMilestones}
          onCreateMilestone={createMilestone}
          onUpdateStatus={updateMilestoneStatus}
        />
      </div>
    </div>
  );
};
