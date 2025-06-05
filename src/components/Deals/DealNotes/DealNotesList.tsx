
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DealNote, DealNoteFormData } from '../types/dealNotes';
import { Profile } from '../types/deal';
import { DealNoteItem } from './DealNoteItem';
import { DealNoteForm } from './DealNoteForm';

interface DealNotesListProps {
  dealId: string;
  profiles: Profile[];
  canModify: boolean;
}

export const DealNotesList: React.FC<DealNotesListProps> = ({
  dealId,
  profiles,
  canModify,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notes for this deal
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['deal-notes', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_notes')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DealNote[];
    },
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (noteData: DealNoteFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('deal_notes')
        .insert({
          deal_id: dealId,
          user_id: user.id,
          content: noteData.content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-notes', dealId] });
      toast({
        title: 'Note added',
        description: 'Your note has been added successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error adding note',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { data, error } = await supabase
        .from('deal_notes')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-notes', dealId] });
      toast({
        title: 'Note updated',
        description: 'Your note has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating note',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deal_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-notes', dealId] });
      toast({
        title: 'Note deleted',
        description: 'The note has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting note',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateNote = (noteData: DealNoteFormData) => {
    createNoteMutation.mutate(noteData);
  };

  const handleUpdateNote = (id: string, content: string) => {
    updateNoteMutation.mutate({ id, content });
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNoteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-12 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canModify && (
        <DealNoteForm
          onSubmit={handleCreateNote}
          isSubmitting={createNoteMutation.isPending}
        />
      )}
      
      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <DealNoteItem
              key={note.id}
              note={note}
              profiles={profiles}
              canModify={canModify}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No notes yet.</p>
          {canModify && <p className="text-sm">Add the first note to get started.</p>}
        </div>
      )}
    </div>
  );
};
