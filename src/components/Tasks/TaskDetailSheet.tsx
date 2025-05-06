import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Edit, Share, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { TaskForm } from '@/components/Tasks/TaskForm';

// Define the Task type to match our database schema
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  campaign_id: string | null;
  creator_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  client_visible: boolean | null;
  related_type: string | null;
  company_id: string | null;
  project_id: string | null;
  assignees?: {
    id: string;
    user_id: string;
  }[];
};

// Define the Contact type for assignees
type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
};

// Updated Campaign type to include company_id property
type Campaign = {
  id: string;
  name: string;
  company_id: string;
};

// Define Project type
type Project = {
  id: string;
  name: string;
};

// Define Company type
type Company = {
  id: string;
  name: string;
};

interface TaskDetailSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
}

export const TaskDetailSheet: React.FC<TaskDetailSheetProps> = ({ isOpen, onOpenChange, taskId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch task details based on taskId
  const { data: task, isLoading, isError } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      if (!taskId) return null;

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) {
        toast({
          title: 'Error fetching task details',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }

      return data as Task;
    },
    enabled: !!taskId, // Only run the query if taskId is not null
  });

  // Fetch profiles for assignees and creator
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .order('first_name');
      
      if (error) {
        toast({
          title: 'Error fetching profiles',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Contact[];
    },
  });

  // Updated: Fetch campaigns for filtering, include company_id
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, company_id')
        .order('name');
      
      if (error) {
        toast({
          title: 'Error fetching campaigns',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Campaign[];
    },
  });

  // Fetch projects for task related info
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
      
      if (error) {
        toast({
          title: 'Error fetching projects',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Project[];
    },
  });

  // Fetch companies for task related info
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      
      if (error) {
        toast({
          title: 'Error fetching companies',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Company[];
    },
  });

  const handleSuccess = () => {
    onOpenChange(false);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  if (isLoading) {
    return <div>Loading task details...</div>;
  }

  if (isError) {
    return <div>Error fetching task details.</div>;
  }

  if (!task) {
    return <div>No task details found.</div>;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{task.title}</SheetTitle>
          <SheetDescription>
            Edit task details here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        
        {/* Update the TaskForm props in the TaskDetailSheet */}
        <TaskForm
          profiles={profiles}
          campaigns={campaigns}
          projects={projects}
          companies={companies}
          initialData={task}
          onSuccess={handleSuccess}
        />

        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
