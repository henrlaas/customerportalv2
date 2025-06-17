
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { KeyResult } from '@/pages/OKRPage';

interface DeleteKeyResultDialogProps {
  keyResult: KeyResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteKeyResultDialog: React.FC<DeleteKeyResultDialogProps> = ({
  keyResult,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteKeyResultMutation = useMutation({
    mutationFn: async (keyResultId: string) => {
      // Delete all updates for this key result first
      const { error: updatesError } = await supabase
        .from('okr_updates')
        .delete()
        .eq('key_result_id', keyResultId);

      if (updatesError) throw updatesError;

      // Then delete the key result
      const { error } = await supabase
        .from('key_results')
        .delete()
        .eq('id', keyResultId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
      if (keyResult) {
        queryClient.invalidateQueries({ queryKey: ['okr', keyResult.okr_id] });
      }
      toast({
        title: 'Key result deleted successfully',
        description: 'The key result has been removed.',
      });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error('Error deleting key result:', error);
      toast({
        title: 'Error deleting key result',
        description: 'An error occurred while deleting the key result. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = () => {
    if (keyResult) {
      deleteKeyResultMutation.mutate(keyResult.id);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Key Result</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{keyResult?.title}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteKeyResultMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteKeyResultMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
