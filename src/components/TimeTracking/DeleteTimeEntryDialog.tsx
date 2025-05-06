
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TimeEntry } from "@/types/timeTracking";

type DeleteTimeEntryDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  timeEntry: TimeEntry | null;
};

export const DeleteTimeEntryDialog = ({
  isOpen,
  onClose,
  onConfirm,
  timeEntry,
}: DeleteTimeEntryDialogProps) => {
  if (!timeEntry) return null;
  
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this time entry?
            {timeEntry.description && (
              <span className="block font-medium mt-2">{timeEntry.description}</span>
            )}
            <span className="block text-sm text-gray-500 mt-1">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
