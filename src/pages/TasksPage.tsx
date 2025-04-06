
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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

const TasksPage = () => {
  const { toast } = useToast();
  
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
    <div>
      <h1>Tasks Page</h1>
      {/* Implement the rest of the Tasks page */}
    </div>
  );
};

export default TasksPage;
