
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface DeleteContractDialogProps {
  contractId: string;
  contractName: string;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteContractDialog({ 
  contractId,
  contractName,
  isOpen,
  onClose,
  onDeleted
}: DeleteContractDialogProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirmDelete) return;
    
    try {
      setIsDeleting(true);
      
      // Delete the contract from the database
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', contractId);
        
      if (error) throw error;
      
      toast({
        title: "Contract deleted",
        description: "The contract has been permanently deleted.",
      });
      
      onDeleted();
      onClose();
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast({
        title: "Error",
        description: "Failed to delete the contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Contract</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this contract? 
            <span className="font-medium block mt-2">{contractName || "Unnamed contract"}</span>
            <p className="mt-2 text-red-500">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex items-center space-x-2 my-4">
          <Checkbox 
            id="confirm-delete" 
            checked={confirmDelete} 
            onCheckedChange={(checked) => setConfirmDelete(checked === true)}
          />
          <label 
            htmlFor="confirm-delete" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I confirm that I have downloaded the PDF contract before deleting it
          </label>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={!confirmDelete || isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 block rounded-full border-2 border-b-transparent border-r-transparent border-white animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>Delete</>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
