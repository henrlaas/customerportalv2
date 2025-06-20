
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AdminEmployeeRoleSelect } from './AdminEmployeeRoleSelect';
import { userService, User } from '@/services/userService';

interface ChangeUserRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function ChangeUserRoleDialog({ isOpen, onClose, user }: ChangeUserRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState(user?.user_metadata?.role || '');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const changeRoleMutation = useMutation({
    mutationFn: async (newRole: string) => {
      if (!user) throw new Error('No user selected');
      
      // Validate role is admin or employee only
      if (!['admin', 'employee'].includes(newRole)) {
        throw new Error('Invalid role selected. Only admin and employee roles are allowed.');
      }
      
      return userService.updateUser(user.id, {
        email: user.email,
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone_number || '',
        role: newRole
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User role has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update user role: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole && user && ['admin', 'employee'].includes(selectedRole)) {
      changeRoleMutation.mutate(selectedRole);
    }
  };

  // Reset selected role when user changes, but only allow admin/employee
  useEffect(() => {
    if (user?.user_metadata?.role && ['admin', 'employee'].includes(user.user_metadata.role)) {
      setSelectedRole(user.user_metadata.role);
    } else {
      setSelectedRole('employee'); // Default to employee for invalid roles
    }
  }, [user]);

  // Don't show dialog for client users
  if (user?.user_metadata?.role === 'client') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Change the role for {user?.user_metadata?.first_name} {user?.user_metadata?.last_name} ({user?.email})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="role" className="text-sm font-medium">
                New Role
              </label>
              <AdminEmployeeRoleSelect
                value={selectedRole}
                onValueChange={setSelectedRole}
              />
              <p className="text-xs text-muted-foreground">
                Only admin and employee roles can be assigned through this dialog.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                !selectedRole || 
                selectedRole === user?.user_metadata?.role || 
                !['admin', 'employee'].includes(selectedRole) ||
                changeRoleMutation.isPending
              }
            >
              {changeRoleMutation.isPending ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
