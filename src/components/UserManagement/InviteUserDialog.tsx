
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { UserManagement } from "@/components/UserManagement";

interface InviteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteUserDialog({ isOpen, onClose }: InviteUserDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation to a new user to join the platform
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <UserManagement onSuccess={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
