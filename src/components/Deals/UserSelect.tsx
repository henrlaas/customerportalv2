
import React from 'react';
import Select, { SingleValue, ActionMeta } from 'react-select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Profile } from './types/deal';

interface UserSelectProps {
  profiles: Profile[];
  selectedUserId: string | null;
  onUserChange: (userId: string | null) => void;
  currentUserId?: string;
}

interface UserOption {
  value: string | null;
  label: string;
  profile?: Profile;
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

  const options: UserOption[] = [
    {
      value: null,
      label: 'All Users',
    },
    ...profiles.map(profile => ({
      value: profile.id,
      label: getUserDisplayName(profile),
      profile,
    }))
  ];

  const selectedOption = options.find(option => option.value === selectedUserId) || options[0];

  const formatOptionLabel = (option: UserOption) => {
    if (!option.profile) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">All Users</span>
        </div>
      );
    }

    const initials = `${option.profile.first_name?.[0] || ''}${option.profile.last_name?.[0] || ''}`.toUpperCase() || 'U';

    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={option.profile.avatar_url || undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm">{option.label}</span>
      </div>
    );
  };

  const handleChange = (
    newValue: SingleValue<UserOption>,
    actionMeta: ActionMeta<UserOption>
  ) => {
    onUserChange(newValue ? newValue.value : null);
  };

  return (
    <Select
      value={selectedOption}
      onChange={handleChange}
      options={options}
      formatOptionLabel={formatOptionLabel}
      isSearchable
      isClearable
      placeholder="Select user..."
      className="min-w-[200px]"
      classNames={{
        control: () => "h-10 border border-input bg-background text-sm",
        menu: () => "bg-popover border border-border shadow-md z-50",
        option: (state) => 
          `px-3 py-2 text-sm cursor-pointer ${
            state.isFocused ? 'bg-accent' : ''
          } ${state.isSelected ? 'bg-primary text-primary-foreground' : ''}`,
      }}
      styles={{
        control: (base, state) => ({
          ...base,
          minHeight: '40px',
          border: '1px solid hsl(var(--input))',
          borderRadius: '6px',
          boxShadow: 'none',
          backgroundColor: 'hsl(var(--background))',
          '&:hover': {
            border: '1px solid hsl(var(--input))',
          },
          '&:focus-within': {
            border: '1px solid hsl(var(--ring))',
            outline: '2px solid transparent',
            outlineOffset: '2px',
            boxShadow: '0 0 0 2px hsl(var(--ring))',
          },
        }),
        indicatorSeparator: () => ({
          display: 'none',
        }),
        menu: (base) => ({
          ...base,
          zIndex: 50,
        }),
      }}
    />
  );
};
