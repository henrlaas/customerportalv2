
import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, UserRound } from "lucide-react";
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
  users: User[];
  selectedUserId: string | null;
  onChange: (selectedId: string | null) => void;
  className?: string;
  placeholder?: string;
};

export function UserSelect({
  users,
  selectedUserId,
  onChange,
  className,
  placeholder = "Select a user..."
}: UserSelectProps) {
  const [open, setOpen] = useState(false);

  // Ensure users is always an array, even if passed as undefined
  const safeUsers = Array.isArray(users) ? users : [];
  
  // Find the selected user
  const selectedUser = safeUsers.find(user => user?.id === selectedUserId);

  const getUserDisplayName = (user: User) => {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User';
  };

  const getInitials = (user: User) => {
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
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
          {selectedUser ? (
            <div className="flex items-center">
              <Avatar className="h-5 w-5 mr-2">
                <AvatarImage src={selectedUser.avatar_url || undefined} />
                <AvatarFallback className="text-xs">{getInitials(selectedUser)}</AvatarFallback>
              </Avatar>
              {getUserDisplayName(selectedUser)}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandEmpty>No user found.</CommandEmpty>
          <CommandGroup>
            <CommandItem 
              key="unassigned"
              value="unassigned" 
              onSelect={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              <UserRound className="mr-2 h-4 w-4" />
              <span>Unassigned</span>
            </CommandItem>
            
            {safeUsers.map((user) => (
              <CommandItem
                key={user.id}
                value={getUserDisplayName(user)}
                onSelect={() => {
                  onChange(user.id);
                  setOpen(false);
                }}
              >
                <Avatar className="h-5 w-5 mr-2">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{getInitials(user)}</AvatarFallback>
                </Avatar>
                {getUserDisplayName(user)}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    selectedUserId === user.id ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
