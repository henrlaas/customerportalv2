import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { UserFilters } from "@/components/UserManagement/UserFilters";
import { UserTable } from "@/components/UserManagement/UserTable";
import { DeleteUserDialog } from "@/components/UserManagement/DeleteUserDialog";
import { InviteUserDialog } from "@/components/UserManagement/InviteUserDialog";
import { EditUserDialog } from "@/components/UserManagement/EditUserDialog";
import { ChangeUserRoleDialog } from "@/components/UserManagement/ChangeUserRoleDialog";
import { useUserFilters } from "@/hooks/useUserFilters";
import { userService, User } from "@/services/userService";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { UserSummaryCards } from './UserSummaryCards';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function UserManagementTab() {
  const { isAdmin, user: currentUser } = useAuth();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showChangeRoleDialog, setShowChangeRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const USERS_PER_PAGE = 15;

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
    roles,
    filteredUsers
  } = useUserFilters(users);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setShowChangeRoleDialog(true);
  };

  const handleResetPassword = (email: string) => {
    resetPasswordMutation.mutate(email);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
      </div>

      <Alert className="bg-[#FEF7CD] border-yellow-300 text-[#1A1F2C]">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          This User Management section should only be used for special cases. By default, please use the Employee Management section for managing personnel.
        </AlertDescription>
      </Alert>

      {/* User Summary Cards */}
      <UserSummaryCards users={users} />

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <UserFilters 
          searchTerm={searchTerm}
          setSearchTerm={(term) => {
            setSearchTerm(term);
            handleFilterChange();
          }}
          roleFilter={roleFilter}
          setRoleFilter={(role) => {
            setRoleFilter(role);
            handleFilterChange();
          }}
          roles={roles}
        />
      </div>

      <div className="rounded-md border">
        <UserTable 
          filteredUsers={paginatedUsers}
          currentUserId={currentUser?.id}
          isLoading={isLoading}
          error={error}
          onDeleteUser={handleDeleteUser}
          onEditUser={handleEditUser}
          onChangeRole={handleChangeRole}
          onResetPassword={handleResetPassword}
          isPendingDelete={deleteUserMutation.isPending}
          isPendingReset={resetPasswordMutation.isPending}
        />
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <InviteUserDialog 
        isOpen={showInviteDialog} 
        onClose={() => {
          setShowInviteDialog(false);
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }} 
      />

      {selectedUser && (
        <>
          <EditUserDialog 
            isOpen={showEditDialog} 
            onClose={() => {
              setShowEditDialog(false);
              setSelectedUser(null);
              queryClient.invalidateQueries({ queryKey: ['users'] });
            }}
            user={selectedUser}
          />
          
          <ChangeUserRoleDialog
            isOpen={showChangeRoleDialog}
            onClose={() => {
              setShowChangeRoleDialog(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
          />
          
          <DeleteUserDialog 
            isOpen={showDeleteConfirmDialog}
            onClose={() => setShowDeleteConfirmDialog(false)}
            onConfirm={handleDeleteConfirm}
            isPending={deleteUserMutation.isPending}
          />
        </>
      )}
    </div>
  );
}
