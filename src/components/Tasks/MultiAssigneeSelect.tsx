
import { useState } from 'react';
import { Check, ChevronsUpDown, X, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [searchQuery, setSearchQuery] = useState("");

  // Ensure users and selectedUserIds are always arrays
  const safeUsers = Array.isArray(users) ? users : [];
  const safeSelectedUserIds = Array.isArray(selectedUserIds) ? selectedUserIds : [];

  const handleSelect = (userId: string, e: React.MouseEvent) => {
    // Stop propagation to prevent the popover from closing
    e.stopPropagation();
    
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

  // Filter users based on search query
  const filteredUsers = safeUsers.filter(user => {
    const displayName = getUserDisplayName(user).toLowerCase();
    return displayName.includes(searchQuery.toLowerCase());
  });

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
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="p-2">
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
            <ScrollArea className="h-[200px]">
              <div className="p-1">
                {filteredUsers.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">No team member found.</div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm cursor-pointer hover:bg-accent"
                      onClick={(e) => handleSelect(user.id, e)}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">{getInitials(user)}</AvatarFallback>
                      </Avatar>
                      {getUserDisplayName(user)}
                      {safeSelectedUserIds.includes(user.id) && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
