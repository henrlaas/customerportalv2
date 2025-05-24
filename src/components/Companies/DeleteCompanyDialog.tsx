
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Company } from '@/types/company';
import { AlertTriangle } from 'lucide-react';

interface DeleteCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  company: Company | null;
  isDeleting: boolean;
}

export const DeleteCompanyDialog = ({
  isOpen,
  onClose,
  onConfirm,
  company,
  isDeleting,
}: DeleteCompanyDialogProps) => {
  const [confirmationText, setConfirmationText] = useState('');

  const handleClose = () => {
    setConfirmationText('');
    onClose();
  };

  const handleConfirm = () => {
    if (confirmationText === company?.name) {
      onConfirm();
      setConfirmationText('');
    }
  };

  const isConfirmDisabled = !company || confirmationText !== company.name || isDeleting;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDialogTitle className="text-red-600">Delete Company</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              You are about to permanently delete <strong>{company?.name}</strong> and all associated data including:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>All company contacts</li>
              <li>All campaigns and ads</li>
              <li>All projects and tasks</li>
              <li>All deals and contracts</li>
              <li>All time tracking entries</li>
            </ul>
            <p className="font-medium text-red-600">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label htmlFor="confirmation">
            Type the company name <strong>{company?.name}</strong> to confirm:
          </Label>
          <Input
            id="confirmation"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="Enter company name exactly"
            disabled={isDeleting}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? 'Deleting...' : 'Delete Company'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
