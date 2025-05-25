
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { supabase } from '@/integrations/supabase/client';
import { CompanyContact } from '@/types/company';

type DeleteContactConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  contact: CompanyContact | null;
  companyId: string;
};

export const DeleteContactConfirmDialog = ({
  isOpen,
  onClose,
  contact,
  companyId,
}: DeleteContactConfirmDialogProps) => {
  const [confirmChecked, setConfirmChecked] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Starting user deletion process for:', userId);
      
      // Call the user-management edge function to delete the user completely
      const { data, error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'delete',
          userId: userId
        }
      });

      if (error) {
        console.error('Error calling user-management function:', error);
        throw new Error(`Failed to delete user: ${error.message}`);
      }

      console.log('User deletion completed:', data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Contact deleted',
        description: 'The contact has been permanently removed from the system',
      });
      queryClient.invalidateQueries({ queryKey: ['companyContacts', companyId] });
      onClose();
      setConfirmChecked(false);
    },
    onError: (error: Error) => {
      console.error('Delete user mutation error:', error);
      toast({
        title: 'Error',
        description: `Failed to delete contact: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const handleDelete = () => {
    if (!contact || !confirmChecked) return;
    deleteUserMutation.mutate(contact.user_id);
  };

  const handleClose = () => {
    setConfirmChecked(false);
    onClose();
  };

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    setConfirmChecked(checked === true);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Contact</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Are you sure you want to permanently delete{' '}
              <strong>
                {contact?.first_name} {contact?.last_name}
              </strong>
              ?
            </p>
            <p className="text-destructive font-medium">
              This action will:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-destructive">
              <li>Remove them from this company</li>
              <li>Delete their profile information</li>
              <li>Permanently delete their user account</li>
            </ul>
            <p className="text-destructive font-medium">
              This action cannot be undone.
            </p>
            
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="confirm-delete"
                checked={confirmChecked}
                onCheckedChange={handleCheckboxChange}
              />
              <label
                htmlFor="confirm-delete"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand this action is permanent and cannot be undone
              </label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!confirmChecked || deleteUserMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteUserMutation.isPending ? 'Deleting...' : 'Delete Contact'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
