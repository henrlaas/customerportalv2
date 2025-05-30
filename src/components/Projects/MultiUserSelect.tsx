
import { useState } from 'react';
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"; 
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type User = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
  role: string;
};

type MultiUserSelectProps = {
  users?: User[];
  selectedUserIds: string[];
  onChange: (selectedIds: string[]) => void;
  className?: string;
  placeholder?: string;
};

export function MultiUserSelect({
  users: providedUsers,
  selectedUserIds,
  onChange,
  className,
  placeholder = "Select users..."
}: MultiUserSelectProps) {
  const [open, setOpen] = useState(false);
  
  // Fetch users from the database if not provided
  const { data: fetchedUsers = [] } = useQuery({
    queryKey: ['users-for-selection'],
    queryFn: async () => {
      // Skip the query if users are provided externally
      if (providedUsers) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, role')
        .in('role', ['admin', 'employee']);
        
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      return data as User[];
    },
    enabled: !providedUsers // Only run the query if users are not provided
  });

  // Use provided users or fetched users
  const users = providedUsers || fetchedUsers;

  // Utility functions
  const getUserDisplayName = (user: User) => {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User';
  };

  const getInitials = (user: User) => {
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };
  
  // Ensure users is always an array, even if passed as undefined
  const safeUsers = Array.isArray(users) ? users : [];
  
  // Get selected users data
  const selectedUsers = safeUsers.filter(user => selectedUserIds.includes(user.id));
  
  const handleSelect = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onChange(selectedUserIds.filter(id => id !== userId));
    } else {
      onChange([...selectedUserIds, userId]);
    }
  };

  const handleRemove = (userId: string) => {
    onChange(selectedUserIds.filter(id => id !== userId));
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedUsers.length > 0 
              ? `${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''} selected` 
              : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {safeUsers.map(user => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={() => handleSelect(user.id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">{getInitials(user)}</AvatarFallback>
                    </Avatar>
                    {getUserDisplayName(user)}
                  </div>
                  {selectedUserIds.includes(user.id) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected users display */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedUsers.map(user => (
            <Badge 
              key={user.id} 
              variant="secondary"
              className="flex items-center gap-1"
            >
              <Avatar className="h-4 w-4">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">{getInitials(user)}</AvatarFallback>
              </Avatar>
              <span className="max-w-[150px] truncate">{getUserDisplayName(user)}</span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(user.id);
                }} 
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
