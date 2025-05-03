
import { useState } from 'react';
import Select from 'react-select';
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
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
  // Ensure users and selectedUserIds are always arrays
  const safeUsers = Array.isArray(users) ? users : [];
  const safeSelectedUserIds = Array.isArray(selectedUserIds) ? selectedUserIds : [];

  // Format users for react-select
  const options = safeUsers.map(user => ({
    value: user.id,
    label: getUserDisplayName(user),
    user
  }));

  // Find selected options
  const selectedOptions = options.filter(option => 
    safeSelectedUserIds.includes(option.value)
  );

  const getUserDisplayName = (user: User) => {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User';
  };

  const getInitials = (user: User) => {
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const handleRemove = (userId: string) => {
    onChange(safeSelectedUserIds.filter(id => id !== userId));
  };

  // Custom formatting for the dropdown options
  const formatOptionLabel = (option: any) => {
    const user = option.user;
    return (
      <div className="flex items-center">
        <Avatar className="h-5 w-5 mr-2">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="text-xs">{getInitials(user)}</AvatarFallback>
        </Avatar>
        {getUserDisplayName(user)}
      </div>
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      {safeSelectedUserIds.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {options.filter(option => safeSelectedUserIds.includes(option.value)).map(option => (
            <Badge 
              key={option.value} 
              variant="secondary" 
              className="flex items-center gap-1 pr-1"
            >
              <Avatar className="h-5 w-5 mr-1">
                <AvatarImage src={option.user.avatar_url || undefined} />
                <AvatarFallback className="text-xs">{getInitials(option.user)}</AvatarFallback>
              </Avatar>
              {getUserDisplayName(option.user)}
              <button 
                type="button"
                className="h-4 w-4 p-0 ml-1 hover:bg-muted rounded-full" 
                onClick={() => handleRemove(option.value)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      <Select
        isMulti
        options={options}
        value={selectedOptions}
        onChange={(selectedOptions) => {
          const newSelectedIds = selectedOptions.map(option => option.value);
          onChange(newSelectedIds);
        }}
        placeholder={placeholder}
        formatOptionLabel={formatOptionLabel}
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
          control: (baseStyles) => ({
            ...baseStyles,
            borderColor: 'hsl(var(--input))',
            boxShadow: 'none',
            '&:hover': {
              borderColor: 'hsl(var(--input))'
            }
          }),
          menu: (baseStyles) => ({
            ...baseStyles,
            zIndex: 50
          })
        }}
      />
    </div>
  );
}
