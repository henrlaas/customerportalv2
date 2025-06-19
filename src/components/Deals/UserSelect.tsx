
import React from 'react';
import Select from 'react-select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Profile } from './types/deal';

interface UserSelectProps {
  profiles: Profile[];
  selectedUserId: string | null;
  onUserChange: (userId: string | null) => void;
  currentUserId?: string;
}

export const UserSelect: React.FC<UserSelectProps> = ({
  profiles,
  selectedUserId,
  onUserChange,
  currentUserId
}) => {
  const getUserDisplayName = (profile: Profile) => {
    const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    return name || profile.id;
  };

  // Format options for react-select
  const options = [
    { value: null, label: 'All Users', isAllUsers: true },
    ...profiles.map(profile => ({
      value: profile.id,
      label: getUserDisplayName(profile),
      profile
    }))
  ];

  // Find the selected option
  const selectedOption = selectedUserId 
    ? options.find(option => option.value === selectedUserId) 
    : options[0]; // Default to "All Users"

  // Custom formatting for the dropdown options
  const formatOptionLabel = (option: any) => {
    if (option.isAllUsers) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">All Users</span>
        </div>
      );
    }

    const profile = option.profile;
    const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || 'U';
    
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm">{getUserDisplayName(profile)}</span>
      </div>
    );
  };

  return (
    <Select
      options={options}
      value={selectedOption}
      onChange={(option) => onUserChange(option?.value ?? null)}
      placeholder="Select user..."
      formatOptionLabel={formatOptionLabel}
      isSearchable={true}
      isClearable={false}
      className="react-select-container min-w-[200px]"
      classNamePrefix="react-select"
      styles={{
        control: (baseStyles, { isFocused }) => ({
          ...baseStyles,
          minHeight: '40px',
          borderColor: isFocused ? 'hsl(var(--ring))' : 'hsl(var(--border))',
          boxShadow: isFocused ? '0 0 0 2px hsl(var(--ring))' : 'none',
          '&:hover': {
            borderColor: 'hsl(var(--border))'
          },
          backgroundColor: 'hsl(var(--background))',
          fontSize: '14px'
        }),
        menu: (baseStyles) => ({
          ...baseStyles,
          zIndex: 50,
          backgroundColor: 'hsl(var(--popover))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '6px',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
        }),
        option: (baseStyles, { isFocused, isSelected }) => ({
          ...baseStyles,
          backgroundColor: isSelected 
            ? '#114742'
            : isFocused 
              ? '#F2FCE2'
              : 'transparent',
          color: isSelected 
            ? 'white'
            : 'hsl(var(--foreground))',
          cursor: 'pointer',
          padding: '8px 12px',
          fontSize: '14px',
          '&:active': {
            backgroundColor: isSelected ? '#114742' : '#F2FCE2'
          }
        }),
        singleValue: (baseStyles) => ({
          ...baseStyles,
          color: 'hsl(var(--foreground))',
          fontSize: '14px'
        }),
        placeholder: (baseStyles) => ({
          ...baseStyles,
          color: 'hsl(var(--muted-foreground))',
          fontSize: '14px'
        }),
        input: (baseStyles) => ({
          ...baseStyles,
          color: 'hsl(var(--foreground))',
          fontSize: '14px'
        }),
        indicatorSeparator: () => ({
          display: 'none'
        }),
        dropdownIndicator: (baseStyles) => ({
          ...baseStyles,
          color: 'hsl(var(--muted-foreground))',
          '&:hover': {
            color: 'hsl(var(--foreground))'
          }
        })
      }}
    />
  );
};
