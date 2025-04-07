
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UserFilters } from "@/components/UserManagement/UserFilters";
import { UserTable } from "@/components/UserManagement/UserTable";
import { DeleteUserDialog } from "@/components/UserManagement/DeleteUserDialog";
import { InviteUserDialog } from "@/components/UserManagement/InviteUserDialog";
import { useUserFilters } from "@/hooks/useUserFilters";
import { userService, User } from "@/services/userService";

const UserManagementPage = () => {
  const { isAdmin, user: currentUser } = useAuth();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Only admins can access this page
  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Fetch users from edge function
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: userService.listUsers
  });

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

  // Handle delete confirmation
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirmDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  // Handle password reset
  const handleResetPassword = (email: string) => {
    resetPasswordMutation.mutate(email);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button 
          className="bg-blue-500 hover:bg-blue-600"
          onClick={() => setShowInviteDialog(true)}
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
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

        <div className="overflow-x-auto">
          <UserTable 
            filteredUsers={filteredUsers}
            currentUserId={currentUser?.id}
            isLoading={isLoading}
            error={error} // We're passing the error as-is, but UserTable now handles any error type
            onDeleteUser={handleDeleteUser}
            onResetPassword={handleResetPassword}
            isPendingDelete={deleteUserMutation.isPending}
            isPendingReset={resetPasswordMutation.isPending}
          />
        </div>
      </div>

      {/* Invite User Dialog */}
      <InviteUserDialog 
        isOpen={showInviteDialog} 
        onClose={() => setShowInviteDialog(false)} 
      />

      {/* Delete Confirmation Dialog */}
      <DeleteUserDialog 
        isOpen={showDeleteConfirmDialog}
        onClose={() => setShowDeleteConfirmDialog(false)}
        onConfirm={handleDeleteConfirm}
        isPending={deleteUserMutation.isPending}
      />
    </div>
  );
};

export default UserManagementPage;
