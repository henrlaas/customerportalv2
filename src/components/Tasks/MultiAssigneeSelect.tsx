
import { useState } from 'react';
import Select from 'react-select';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type User = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
  role: string;
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
  // Utility functions defined BEFORE they are used
  const getUserDisplayName = (user: User) => {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User';
  };

  const getInitials = (user: User) => {
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };
  
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
    <div className={cn("", className)}>
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
            backgroundColor: 'hsl(var(--background))',
            borderRadius: 'var(--radius)',
            boxShadow: 'none',
            '&:hover': {
              borderColor: 'hsl(var(--input))'
            },
            padding: '1px',
            minHeight: '40px'
          }),
          placeholder: (baseStyles) => ({
            ...baseStyles,
            color: 'hsl(var(--muted-foreground))'
          }),
          menu: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
            zIndex: 50
          }),
          option: (baseStyles, { isFocused, isSelected }) => ({
            ...baseStyles,
            backgroundColor: isFocused 
              ? '#f3f3f3' // Light gray for hover/focus
              : isSelected 
                ? 'hsl(var(--accent) / 0.2)'
                : undefined,
            color: 'hsl(var(--foreground))'
          }),
          multiValue: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: 'hsl(var(--accent) / 0.2)',
          }),
          multiValueLabel: (baseStyles) => ({
            ...baseStyles,
            color: 'hsl(var(--accent-foreground))',
          }),
          multiValueRemove: (baseStyles) => ({
            ...baseStyles,
            color: 'hsl(var(--accent-foreground))',
            '&:hover': {
              backgroundColor: '#f3f3f3', // Light gray hover instead of green
              color: 'hsl(var(--accent-foreground))',
            },
          }),
          input: (baseStyles) => ({
            ...baseStyles,
            color: 'hsl(var(--foreground))'
          }),
          indicatorsContainer: (baseStyles) => ({
            ...baseStyles,
            color: 'hsl(var(--foreground) / 0.5)'
          }),
          dropdownIndicator: (baseStyles) => ({
            ...baseStyles,
            color: 'hsl(var(--foreground) / 0.5)',
            '&:hover': {
              color: 'hsl(var(--foreground) / 0.8)'
            }
          }),
          clearIndicator: (baseStyles) => ({
            ...baseStyles,
            color: 'hsl(var(--foreground) / 0.5)',
            '&:hover': {
              color: 'hsl(var(--foreground) / 0.8)'
            }
          }),
          valueContainer: (baseStyles) => ({
            ...baseStyles,
            padding: '2px 8px'
          })
        }}
      />
    </div>
  );
}
