
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Check, ChevronsUpDown, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type User = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
};

type UserSelectProps = {
  selectedUserId: string | null;
  onChange: (selectedId: string | null) => void;
  className?: string;
  placeholder?: string;
  // New properties for multi-select support
  selectedUserIds?: string[];
  onUsersChange?: (userIds: string[]) => void;
  multiple?: boolean;
};

export function UserSelect({
  selectedUserId,
  onChange,
  className,
  placeholder = "Select user...",
  selectedUserIds,
  onUsersChange,
  multiple = false
}: UserSelectProps) {
  const [open, setOpen] = useState(false);
  
  // Fetch users from profiles table
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-for-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .order('first_name');
        
      if (error) throw error;
      return data as User[];
    }
  });

  const handleSelect = (userId: string) => {
    if (multiple && onUsersChange && selectedUserIds) {
      // Toggle selection for multi-select
      const newSelection = selectedUserIds.includes(userId)
        ? selectedUserIds.filter(id => id !== userId)
        : [...selectedUserIds, userId];
      onUsersChange(newSelection);
    } else if (onChange) {
      // Single select
      onChange(userId === selectedUserId ? null : userId);
      setOpen(false);
    }
  };

  // Get display name for selected user (single mode)
  const getSelectedUserName = () => {
    if (!selectedUserId) return placeholder;
    const user = users.find(u => u.id === selectedUserId);
    return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : placeholder;
  };

  // Get count text for multi-select mode
  const getSelectedCountText = () => {
    if (!selectedUserIds || selectedUserIds.length === 0) return placeholder;
    return `${selectedUserIds.length} user${selectedUserIds.length === 1 ? '' : 's'} selected`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {multiple ? getSelectedCountText() : getSelectedUserName()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandEmpty>No users found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {users.map((user) => {
              const displayName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User';
              const isSelected = multiple 
                ? selectedUserIds?.includes(user.id)
                : user.id === selectedUserId;
                
              return (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={() => handleSelect(user.id)}
                >
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={user.avatar_url || undefined} alt={displayName} />
                      <AvatarFallback>
                        {(user.first_name?.[0] || '') + (user.last_name?.[0] || '')}
                      </AvatarFallback>
                    </Avatar>
                    <span>{displayName}</span>
                  </div>
                  {isSelected && <Check className="ml-auto h-4 w-4" />}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
