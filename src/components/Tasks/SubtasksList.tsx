
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit2, Trash2, Plus, Save } from 'lucide-react';

type Subtask = {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  position: number;
};

type SubtasksListProps = {
  taskId: string;
};

export const SubtasksList = ({ taskId }: SubtasksListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newSubtask, setNewSubtask] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');

  // Fetch subtasks
  const { data: subtasks = [], isLoading } = useQuery({
    queryKey: ['subtasks', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', taskId)
        .order('position');
      
      if (error) {
        toast({
          title: 'Error fetching subtasks',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Subtask[];
    },
    enabled: !!taskId
  });

  // Add subtask mutation
  const addSubtask = useMutation({
    mutationFn: async (title: string) => {
      const position = subtasks.length;
      
      const { data, error } = await supabase
        .from('subtasks')
        .insert({
          task_id: taskId,
          title,
          is_completed: false,
          position
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewSubtask('');
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
      toast({
        title: 'Subtask added'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error adding subtask',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update subtask mutation
  const updateSubtask = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Subtask> }) => {
      const { error } = await supabase
        .from('subtasks')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
      setEditingSubtaskId(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating subtask',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete subtask mutation
  const deleteSubtask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
      toast({
        title: 'Subtask deleted'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting subtask',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    addSubtask.mutate(newSubtask.trim());
  };

  const handleToggleCompleted = (subtask: Subtask) => {
    updateSubtask.mutate({ 
      id: subtask.id, 
      data: { is_completed: !subtask.is_completed } 
    });
  };

  const handleEditSubtask = (subtask: Subtask) => {
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskTitle(subtask.title);
  };

  const handleSaveEdit = (subtaskId: string) => {
    if (!editingSubtaskTitle.trim()) return;
    updateSubtask.mutate({
      id: subtaskId,
      data: { title: editingSubtaskTitle.trim() }
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Subtasks</h3>
      
      {/* Add new subtask form */}
      <form onSubmit={handleAddSubtask} className="flex gap-2">
        <Input
          placeholder="Add a subtask..."
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="sm"
          disabled={!newSubtask.trim() || addSubtask.isPending}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </form>
      
      {/* Subtasks list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-muted animate-pulse rounded"></div>
            ))}
          </div>
        ) : subtasks.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No subtasks yet</p>
        ) : (
          subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className={`flex items-center gap-2 p-2 rounded-md border ${subtask.is_completed ? 'bg-muted/30' : ''}`}
            >
              <Checkbox
                checked={subtask.is_completed}
                onCheckedChange={() => handleToggleCompleted(subtask)}
                className="h-5 w-5"
              />
              
              {editingSubtaskId === subtask.id ? (
                <div className="flex flex-1 gap-2">
                  <Input
                    value={editingSubtaskTitle}
                    onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSaveEdit(subtask.id)}
                    disabled={!editingSubtaskTitle.trim()}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <span className={`flex-1 ${subtask.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                  {subtask.title}
                </span>
              )}
              
              {editingSubtaskId !== subtask.id && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSubtask(subtask)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSubtask.mutate(subtask.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
