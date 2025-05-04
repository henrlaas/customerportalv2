
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2 } from 'lucide-react';

interface DeleteAdSetDialogProps {
  adsetId: string;
  adsetName: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  disabled?: boolean;
}

export function DeleteAdSetDialog({ adsetId, adsetName, onSuccess, trigger, disabled = false }: DeleteAdSetDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      // First delete all ads in this adset
      const { error: adsError } = await supabase
        .from('ads')
        .delete()
        .eq('adset_id', adsetId);

      if (adsError) throw adsError;

      // Then delete the adset
      const { error: adsetError } = await supabase
        .from('adsets')
        .delete()
        .eq('id', adsetId);

      if (adsetError) throw adsetError;

      toast({
        title: 'Ad Set deleted',
        description: 'The ad set and all its ads have been deleted successfully.',
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete ad set. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="secondary" size="sm" disabled={disabled}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Ad Set</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{adsetName}"? This action will also delete all ads within
            this ad set. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading || disabled}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading || disabled}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
