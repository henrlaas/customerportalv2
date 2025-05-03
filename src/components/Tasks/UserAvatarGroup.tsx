
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type User = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
};

type UserAvatarGroupProps = {
  users: User[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
};

export function UserAvatarGroup({ users, max = 3, size = 'md' }: UserAvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;
  
  const getInitials = (user: User) => {
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };
  
  const getUserDisplayName = (user: User) => {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User';
  };
  
  const sizeClasses = {
    sm: "h-6 w-6 -ml-1.5 first:ml-0 text-xs",
    md: "h-8 w-8 -ml-2 first:ml-0 text-sm",
    lg: "h-10 w-10 -ml-3 first:ml-0 text-base",
  };
  
  const remainingClasses = {
    sm: "h-6 w-6 -ml-1.5 text-xs",
    md: "h-8 w-8 -ml-2 text-xs",
    lg: "h-10 w-10 -ml-3 text-sm",
  };

  return (
    <div className="flex">
      {displayUsers.map((user) => (
        <Avatar 
          key={user.id} 
          className={sizeClasses[size]} 
          title={getUserDisplayName(user)}
        >
          <AvatarImage src={user.avatar_url || undefined} alt={getUserDisplayName(user)} />
          <AvatarFallback>{getInitials(user)}</AvatarFallback>
        </Avatar>
      ))}
      
      {remaining > 0 && (
        <Avatar className={remainingClasses[size]} title={`${remaining} more users`}>
          <AvatarFallback>+{remaining}</AvatarFallback>
        </Avatar>
      )}
      
      {users.length === 0 && (
        <Avatar 
          className={sizeClasses[size]} 
          title="Unassigned"
        >
          <AvatarFallback>-</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
