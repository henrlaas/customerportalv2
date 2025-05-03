
import { useState } from 'react';
import Select from 'react-select';
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
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
  // Ensure users is always an array, even if passed as undefined
  const safeUsers = Array.isArray(users) ? users : [];
  
  // Format users for react-select
  const options = [
    { value: null, label: 'Unassigned', isUnassigned: true },
    ...safeUsers.map(user => ({
      value: user.id,
      label: getUserDisplayName(user),
      user
    }))
  ];

  // Find the selected option
  const selectedOption = selectedUserId 
    ? options.find(option => option.value === selectedUserId) 
    : options[0];

  const getUserDisplayName = (user: User) => {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User';
  };

  const getInitials = (user: User) => {
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Custom formatting for the dropdown options
  const formatOptionLabel = (option: any) => {
    if (option.isUnassigned) {
      return (
        <div className="flex items-center">
          <UserRound className="mr-2 h-4 w-4" />
          <span>Unassigned</span>
        </div>
      );
    }

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
    <div className={className}>
      <Select
        options={options}
        value={selectedOption}
        onChange={(option) => onChange(option?.value ?? null)}
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
