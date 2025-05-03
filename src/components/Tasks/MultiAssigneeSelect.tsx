
import { useState } from 'react';
import { Check, ChevronsUpDown, X, UserRound } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type User = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
};

type MultiAssigneeSelectProps = {
  users: User[];
  selectedUserIds: string[];
  onChange: (selectedIds: string[]) => void;
  className?: string;
  placeholder?: string;
};

export function MultiAssigneeSelect({
  users,
  selectedUserIds,
  onChange,
  className,
  placeholder = "Select team members..."
}: MultiAssigneeSelectProps) {
  const [open, setOpen] = useState(false);

  // Ensure users and selectedUserIds are always arrays
  const safeUsers = Array.isArray(users) ? users : [];
  const safeSelectedUserIds = Array.isArray(selectedUserIds) ? selectedUserIds : [];

  const handleSelect = (userId: string) => {
    if (safeSelectedUserIds.includes(userId)) {
      // Remove if already selected
      onChange(safeSelectedUserIds.filter(id => id !== userId));
    } else {
      // Add if not selected
      onChange([...safeSelectedUserIds, userId]);
    }
  };

  const handleRemove = (userId: string) => {
    onChange(safeSelectedUserIds.filter(id => id !== userId));
  };

  const getUserDisplayName = (user: User) => {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User';
  };

  const getInitials = (user: User) => {
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const selectedUsers = safeUsers.filter(user => safeSelectedUserIds.includes(user.id));

  return (
    <div className={cn("space-y-2", className)}>
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedUsers.map(user => (
            <Badge 
              key={user.id} 
              variant="secondary" 
              className="flex items-center gap-1 pr-1"
            >
              <Avatar className="h-5 w-5 mr-1">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="text-xs">{getInitials(user)}</AvatarFallback>
              </Avatar>
              {getUserDisplayName(user)}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => handleRemove(user.id)}
                type="button"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", !safeSelectedUserIds.length && "text-muted-foreground")}
            type="button"
          >
            {safeSelectedUserIds.length > 0
              ? `${safeSelectedUserIds.length} team member${safeSelectedUserIds.length > 1 ? 's' : ''} selected`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search team members..." />
            <CommandEmpty>No team member found.</CommandEmpty>
            <CommandGroup>
              {safeUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  value={getUserDisplayName(user)}
                  onSelect={() => {
                    handleSelect(user.id);
                  }}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">{getInitials(user)}</AvatarFallback>
                  </Avatar>
                  {getUserDisplayName(user)}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      safeSelectedUserIds.includes(user.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
