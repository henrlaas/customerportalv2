
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UserFilters } from "@/components/UserManagement/UserFilters";
import { UserTable } from "@/components/UserManagement/UserTable";
import { DeleteUserDialog } from "@/components/UserManagement/DeleteUserDialog";
import { InviteUserDialog } from "@/components/UserManagement/InviteUserDialog";
import { EditUserDialog } from "@/components/UserManagement/EditUserDialog";
import { useUserFilters } from "@/hooks/useUserFilters";
import { userService, User } from "@/services/userService";

export function UserManagementTab() {
  const { isAdmin, user: currentUser } = useAuth();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users from edge function
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: userService.listUsers,
    retry: 2,
    retryDelay: 1000,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: `Failed to load users: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  });

  // filtering logic
  const {
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    teamFilter,
    setTeamFilter,
    roles,
    teams,
    filteredUsers
  } = useUserFilters(users);

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User has been deleted",
      });
      setSelectedUser(null);
      setShowDeleteConfirmDialog(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Send password reset email mutation
  const resetPasswordMutation = useMutation({
    mutationFn: userService.resetPassword,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password reset email has been sent",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to send password reset email: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // handlers
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirmDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleResetPassword = (email: string) => {
    resetPasswordMutation.mutate(email);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Button 
          className="bg-blue-500 hover:bg-blue-600"
          onClick={() => setShowInviteDialog(true)}
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-lg w-full">
        <UserFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          teamFilter={teamFilter}
          setTeamFilter={setTeamFilter}
          roles={roles}
          teams={teams}
        />

        <div className="w-full overflow-x-auto">
          <UserTable 
            filteredUsers={filteredUsers}
            currentUserId={currentUser?.id}
            isLoading={isLoading}
            error={error}
            onDeleteUser={handleDeleteUser}
            onEditUser={handleEditUser}
            onResetPassword={handleResetPassword}
            isPendingDelete={deleteUserMutation.isPending}
            isPendingReset={resetPasswordMutation.isPending}
          />
        </div>
      </div>

      <InviteUserDialog 
        isOpen={showInviteDialog} 
        onClose={() => setShowInviteDialog(false)} 
      />

      <EditUserDialog 
        isOpen={showEditDialog} 
        onClose={() => setShowEditDialog(false)}
        user={selectedUser}
      />

      <DeleteUserDialog 
        isOpen={showDeleteConfirmDialog}
        onClose={() => setShowDeleteConfirmDialog(false)}
        onConfirm={handleDeleteConfirm}
        isPending={deleteUserMutation.isPending}
      />
    </div>
  );
}
