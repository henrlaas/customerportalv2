
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Search, Calendar, User } from 'lucide-react';

// Fix the Task type definition to match what's coming from the database
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  campaign_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  related_to?: { type: "none" | "deal" | "company" | "contact"; id: string } | null;
};

// Define the Contact type which was missing
type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

// Define the task schema for form validation
const taskSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'completed']),
  due_date: z.string().optional(),
  assigned_to: z.string().optional(),
  campaign_id: z.string().optional(),
  related_to: z.object({
    type: z.enum(['none', 'deal', 'company', 'contact']),
    id: z.string().optional()
  }).optional()
});

export const TasksPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fix the contacts query
  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .order('first_name');
      
      if (error) {
        toast({
          title: 'Error fetching contacts',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Contact[];
    },
  });

  // Tasks query
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        toast({
          title: 'Error fetching tasks',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data.map(task => ({
        ...task,
        related_to: task.related_to || { type: 'none', id: '' }
      })) as Task[];
    },
  });

  // Fix the task form
  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium' as const,
      status: 'todo' as const,
      due_date: '',
      assigned_to: '',
      campaign_id: '',
      related_to: {
        type: 'none' as const,
        id: ''
      }
    },
  });
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tasks</h1>
      
      {isLoadingTasks ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-medium mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-4">Create your first task to get started</p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(task => (
            <Card key={task.id} className="mb-4">
              <CardHeader>
                <CardTitle>{task.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {task.description && <p className="text-muted-foreground mb-4">{task.description}</p>}
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {contacts.find(c => c.id === task.assigned_to) 
                      ? `${contacts.find(c => c.id === task.assigned_to)?.first_name || ''} 
                         ${contacts.find(c => c.id === task.assigned_to)?.last_name || ''}`
                      : 'Unassigned'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
