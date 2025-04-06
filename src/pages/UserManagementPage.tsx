
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserManagement } from "@/components/UserManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { 
  UserPlus,
  Search, 
  Filter, 
  MoreHorizontal, 
  Trash2,
  KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    role?: string;
    team?: string;
  };
  created_at: string;
}

const UserManagementPage = () => {
  const { isAdmin, user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Only admins can access this page
  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Fetch users from edge function
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await supabase.functions.invoke('user-management', {
        body: { action: 'list' }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Error fetching users');
      }
      
      return response.data.users || [];
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await supabase.functions.invoke('user-management', {
        body: {
          action: 'delete',
          userId,
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Error deleting user');
      }
      
      return response.data;
    },
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
    mutationFn: async (email: string) => {
      const response = await supabase.functions.invoke('user-management', {
        body: {
          action: 'resetPassword',
          email,
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Error sending password reset');
      }
      
      return response.data;
    },
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

  // Handle password reset
  const handleResetPassword = (email: string) => {
    resetPasswordMutation.mutate(email);
  };

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const fullName = `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim();
    const email = user.email || '';
    const role = user.user_metadata?.role || '';
    const team = user.user_metadata?.team || '';
    
    const matchesSearch = 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesRole = roleFilter === "All Roles" || role === roleFilter;
    const matchesTeam = teamFilter === "All Teams" || team === teamFilter;
    
    return matchesSearch && matchesRole && matchesTeam;
  });

  // Get unique roles and teams for filters - fix type issues here
  const roles: string[] = ["All Roles", ...Array.from(new Set(users
    .map(user => user.user_metadata?.role || '')
    .filter(Boolean) as string[]))];
  
  const teams: string[] = ["All Teams", ...Array.from(new Set(users
    .map(user => user.user_metadata?.team || '')
    .filter(Boolean) as string[]))];

  // Role badge color based on role
  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "employee":
        return "bg-blue-100 text-blue-800";
      case "client":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get user initials
  const getUserInitials = (user: User) => {
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    } else {
      return "?";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
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
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by role" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by team" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">Loading users...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">Error loading users: {(error as Error).message}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-gray-600 font-medium">
                            {getUserInitials(user)}
                          </div>
                          <span className="font-medium">
                            {user.user_metadata?.first_name || ''} {user.user_metadata?.last_name || ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell>
                        {user.user_metadata?.role && (
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(user.user_metadata.role)}`}>
                            {user.user_metadata.role}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">{user.user_metadata?.team || '-'}</TableCell>
                      <TableCell className="text-gray-600">{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            title="Reset Password"
                            onClick={() => handleResetPassword(user.email)}
                            disabled={resetPasswordMutation.isPending}
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-600" 
                            title="Delete User"
                            onClick={() => handleDeleteUser(user)}
                            disabled={user.id === currentUser?.id || deleteUserMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users found matching your search criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation to a new user to join the platform
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <UserManagement onSuccess={() => setShowInviteDialog(false)} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser.id)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;
