
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Check, Clock, Link2, Pencil, Plus, Trash2, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { TaskForm } from './TaskForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TaskTimer } from './TaskTimer';
import { TaskAttachments } from './TaskAttachments';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface TaskDetailSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
}

// Define interfaces for related objects
interface TaskProject {
  id: string;
  name: string;
}

interface TaskCompany {
  id: string;
  name: string;
}

interface TaskCampaign {
  id: string;
  name: string;
}

interface TaskCreator {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

// Define helper type guards
const isValidProject = (project: any): project is TaskProject => {
  return project && typeof project === 'object' && 'name' in project;
};

const isValidCompany = (company: any): company is TaskCompany => {
  return company && typeof company === 'object' && 'name' in company;
};

const isValidCampaign = (campaign: any): campaign is TaskCampaign => {
  return campaign && typeof campaign === 'object' && 'name' in campaign;
};

const isValidCreator = (creator: any): creator is TaskCreator => {
  return creator && typeof creator === 'object' && 'id' in creator;
};

export const TaskDetailSheet: React.FC<TaskDetailSheetProps> = ({
  isOpen,
  onOpenChange,
  taskId,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      if (!taskId) return null;

      // Modified query to fetch task data without using join syntax
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) {
        console.error('Error fetching task:', taskError);
        toast({
          title: 'Error fetching task',
          description: taskError.message,
          variant: 'destructive',
        });
        return null;
      }

      // Fetch assignees separately
      const { data: assigneesData, error: assigneesError } = await supabase
        .from('task_assignees')
        .select('id, user_id')
        .eq('task_id', taskId);

      if (assigneesError) {
        console.error('Error fetching task assignees:', assigneesError);
      }

      // Fetch company data if company_id exists
      let companyData = null;
      if (taskData.company_id) {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', taskData.company_id)
          .single();
        
        if (!companyError) {
          companyData = company;
        } else {
          console.error('Error fetching company:', companyError);
        }
      }

      // Fetch campaign data if campaign_id exists
      let campaignData = null;
      if (taskData.campaign_id) {
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', taskData.campaign_id)
          .single();
        
        if (!campaignError) {
          campaignData = campaign;
        } else {
          console.error('Error fetching campaign:', campaignError);
        }
      }

      // Fetch project data if project_id exists
      let projectData = null;
      if (taskData.project_id) {
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', taskData.project_id)
          .single();
        
        if (!projectError) {
          projectData = project;
        } else {
          console.error('Error fetching project:', projectError);
        }
      }

      // Fetch creator profile if creator_id exists
      let creatorData = null;
      if (taskData.creator_id) {
        const { data: creator, error: creatorError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', taskData.creator_id)
          .single();
        
        if (!creatorError) {
          creatorData = creator;
        } else {
          console.error('Error fetching creator:', creatorError);
        }
      }

      // Combine all data
      const completeTaskData = {
        ...taskData,
        assignees: assigneesData || [],
        company: companyData,
        campaign: campaignData,
        project: projectData,
        creator: creatorData
      };

      console.log('Task data:', completeTaskData);
      return completeTaskData;
    },
    enabled: !!taskId && isOpen,
  });

  // Fetch profiles for assignees
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, role')
        .in('role', ['admin', 'employee'])
        .order('first_name');
      
      if (error) {
        console.error('Error fetching profiles:', error);
        return [];
      }
      
      return data;
    },
  });

  // Fetch campaigns for task editing
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, company_id')
        .order('name');
      
      if (error) {
        console.error('Error fetching campaigns:', error);
        return [];
      }
      
      return data;
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task deleted',
        description: 'The task has been successfully deleted',
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting task',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle delete task
  const handleDeleteTask = () => {
    if (taskId) {
      deleteTaskMutation.mutate(taskId);
      setIsDeleteDialogOpen(false);
    }
  };

  // Function to get assignee names
  const getAssigneeNames = () => {
    if (!task?.assignees) return 'Unassigned';
    
    return task.assignees
      .map(assignee => {
        const profile = profiles.find(p => p.id === assignee.user_id);
        return profile ? 
          `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
          'Unknown User';
      })
      .join(', ');
  };

  // Function to format priority and status badges
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      default:
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Todo</Badge>;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-[700px] p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-6 pb-2">
              <SheetTitle className="text-xl">
                {isLoading ? 'Loading...' : task?.title || 'Task not found'}
              </SheetTitle>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-6 pt-2">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ) : task ? (
                <>
                  {/* Status and Priority section - Always visible */}
                  <div className="mb-4 flex flex-wrap gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                      <div>{getStatusBadge(task.status)}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Priority</h3>
                      <div>{getPriorityBadge(task.priority)}</div>
                    </div>
                  </div>
                  
                  {/* Description section - Always visible */}
                  {task.description && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                      <div className="bg-gray-50 p-3 rounded whitespace-pre-wrap">{task.description}</div>
                    </div>
                  )}
                  
                  <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="time">Time Tracking</TabsTrigger>
                      <TabsTrigger value="attachments">Attachments</TabsTrigger>
                    </TabsList>
                    
                    {/* Details Tab */}
                    <TabsContent value="details" className="mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Assigned to</h3>
                          <div className="flex items-center">
                            <UserPlus className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{getAssigneeNames()}</span>
                          </div>
                        </div>
                        {task.due_date && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Due date</h3>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{format(new Date(task.due_date), 'PPP')}</span>
                            </div>
                          </div>
                        )}
                        {isValidCompany(task.company) && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Company</h3>
                            <div>{task.company.name}</div>
                          </div>
                        )}
                        {isValidCampaign(task.campaign) && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Campaign</h3>
                            <div>{task.campaign.name}</div>
                          </div>
                        )}
                        {isValidProject(task.project) && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Project</h3>
                            <div>{task.project.name}</div>
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Created by</h3>
                          <div className="flex items-center">
                            {isValidCreator(task.creator) ? (
                              <>
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarFallback>
                                    {task.creator.first_name?.[0] || '?'}
                                    {task.creator.last_name?.[0] || ''}
                                  </AvatarFallback>
                                </Avatar>
                                <span>
                                  {task.creator.first_name} {task.creator.last_name}
                                </span>
                              </>
                            ) : (
                              <span>Unknown</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                          <div>{format(new Date(task.created_at), 'PPP')}</div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Time Tracking Tab */}
                    <TabsContent value="time" className="mt-0">
                      <TaskTimer taskId={task.id} />
                    </TabsContent>
                    
                    {/* Attachments Tab */}
                    <TabsContent value="attachments" className="mt-0">
                      <TaskAttachments taskId={task.id} />
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <div className="text-center p-6">
                  <p>Task not found</p>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Task Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteTask}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Task Dialog */}
      {task && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <TaskForm
              taskId={taskId || undefined}
              initialData={task}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['task', taskId] });
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
              }}
              profiles={profiles}
              campaigns={campaigns}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TaskDetailSheet;
