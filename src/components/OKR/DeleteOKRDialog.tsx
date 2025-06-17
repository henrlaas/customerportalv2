
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
import { OKR } from '@/pages/OKRPage';

interface DeleteOKRDialogProps {
  okr: OKR | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteOKRDialog: React.FC<DeleteOKRDialogProps> = ({
  okr,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteOKRMutation = useMutation({
    mutationFn: async (okrId: string) => {
      // First delete all key results
      const { error: keyResultsError } = await supabase
        .from('key_results')
        .delete()
        .eq('okr_id', okrId);

      if (keyResultsError) throw keyResultsError;

      // Then delete all OKR updates
      const { error: updatesError } = await supabase
        .from('okr_updates')
        .delete()
        .eq('okr_id', okrId);

      if (updatesError) throw updatesError;

      // Finally delete the OKR
      const { error: okrError } = await supabase
        .from('okrs')
        .delete()
        .eq('id', okrId);

      if (okrError) throw okrError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
      toast({
        title: 'OKR deleted successfully',
        description: 'The objective and all its key results have been removed.',
      });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error('Error deleting OKR:', error);
      toast({
        title: 'Error deleting OKR',
        description: 'An error occurred while deleting the objective. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = () => {
    if (okr) {
      deleteOKRMutation.mutate(okr.id);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Objective</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{okr?.title}"? This action cannot be undone and will also delete all associated key results.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteOKRMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteOKRMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
