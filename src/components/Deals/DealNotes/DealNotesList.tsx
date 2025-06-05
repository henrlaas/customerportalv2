
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, insertWithUser, updateWithUser } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DealNote } from '../types/dealNotes';
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch deal notes
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
    mutationFn: async (content: string) => {
      const { data, error } = await insertWithUser('deal_notes', {
        deal_id: dealId,
        content: content.trim(),
      });

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
      const { data, error } = await updateWithUser('deal_notes', id, {
        content: content.trim(),
      });

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
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('deal_notes')
        .delete()
        .eq('id', noteId);

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

  const handleCreateNote = (content: string) => {
    createNoteMutation.mutate(content);
  };

  const handleUpdateNote = (id: string, content: string) => {
    updateNoteMutation.mutate({ id, content });
  };

  const handleDeleteNote = (noteId: string) => {
    // Remove any browser confirmation dialog - let the AlertDialog in DealNoteItem handle it
    deleteNoteMutation.mutate(noteId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
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

      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No notes yet. {canModify && 'Add the first note above.'}
          </div>
        ) : (
          notes.map((note) => (
            <DealNoteItem
              key={note.id}
              note={note}
              profiles={profiles}
              canModify={canModify}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
            />
          ))
        )}
      </div>
    </div>
  );
};
