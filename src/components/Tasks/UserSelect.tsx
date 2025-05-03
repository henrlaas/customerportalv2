
import { useState } from 'react';
import { Check, ChevronsUpDown, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter users based on search query
  const filteredUsers = safeUsers.filter(user => {
    const displayName = getUserDisplayName(user).toLowerCase();
    return displayName.includes(searchQuery.toLowerCase());
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          type="button"
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
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
          <ScrollArea className="h-[200px]">
            <div className="p-1">
              <div 
                className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm cursor-pointer hover:bg-accent"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <UserRound className="mr-2 h-4 w-4" />
                <span>Unassigned</span>
                {selectedUserId === null && <Check className="ml-auto h-4 w-4" />}
              </div>
              
              {filteredUsers.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">No user found.</div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm cursor-pointer hover:bg-accent"
                    onClick={() => {
                      onChange(user.id);
                      setOpen(false);
                    }}
                  >
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">{getInitials(user)}</AvatarFallback>
                    </Avatar>
                    {getUserDisplayName(user)}
                    {selectedUserId === user.id && (
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
  );
}
