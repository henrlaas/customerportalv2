import { User } from "@/services/userService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, KeyRound, Trash2, UserCog } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserTableProps {
  filteredUsers: User[];
  currentUserId?: string;
  isLoading: boolean;
  error: unknown;
  onDeleteUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onResetPassword: (email: string) => void;
  onChangeRole: (user: User) => void;
  isPendingDelete: boolean;
  isPendingReset: boolean;
}

export function UserTable({
  filteredUsers,
  currentUserId,
  isLoading,
  error,
  onDeleteUser,
  onEditUser,
  onResetPassword,
  onChangeRole,
  isPendingDelete,
  isPendingReset
}: UserTableProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

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

  // Get user initials from first_name and last_name
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

  if (isLoading) {
    return <div className="p-8 text-center">Loading users...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading users: {error instanceof Error ? error.message : String(error)}</div>;
  }

  return (
    <Table>
      <TableHeader className="bg-muted">
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={`${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {user.user_metadata?.first_name || ''} {user.user_metadata?.last_name || ''}
                  </span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.user_metadata?.role && (
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(user.user_metadata.role)}`}>
                    {user.user_metadata.role}
                  </span>
                )}
              </TableCell>
              <TableCell>{formatDate(user.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    title="Edit User"
                    onClick={() => onEditUser(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    title="Change Role"
                    onClick={() => onChangeRole(user)}
                  >
                    <UserCog className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    title="Reset Password"
                    onClick={() => onResetPassword(user.email)}
                    disabled={isPendingReset}
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-600" 
                    title="Delete User"
                    onClick={() => onDeleteUser(user)}
                    disabled={user.id === currentUserId || isPendingDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No users found matching your search criteria
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
