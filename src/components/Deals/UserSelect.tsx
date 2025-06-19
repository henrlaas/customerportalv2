
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  const getSelectedDisplayValue = () => {
    if (!selectedUserId) return 'All Users';
    const selectedProfile = profiles.find(p => p.id === selectedUserId);
    return selectedProfile ? getUserDisplayName(selectedProfile) : 'Select user...';
  };

  const handleValueChange = (value: string) => {
    onUserChange(value === 'all' ? null : value);
  };

  return (
    <Select
      value={selectedUserId || 'all'}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="min-w-[200px] h-10">
        <SelectValue>
          <div className="flex items-center gap-2">
            {selectedUserId && selectedUserId !== 'all' ? (
              <>
                {(() => {
                  const selectedProfile = profiles.find(p => p.id === selectedUserId);
                  if (selectedProfile) {
                    const initials = `${selectedProfile.first_name?.[0] || ''}${selectedProfile.last_name?.[0] || ''}`.toUpperCase() || 'U';
                    return (
                      <>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={selectedProfile.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{getUserDisplayName(selectedProfile)}</span>
                      </>
                    );
                  }
                  return <span className="text-sm">Select user...</span>;
                })()}
              </>
            ) : (
              <span className="text-sm">All Users</span>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent 
        align="start"
        className="min-w-[200px]"
        style={{
          '--hover-bg': '#F2FCE2',
          '--selected-bg': '#114742',
        } as React.CSSProperties}
      >
        <SelectItem 
          value="all"
          className="flex items-center gap-2 cursor-pointer hover:bg-[#F2FCE2] data-[state=checked]:bg-[#114742] data-[state=checked]:text-white focus:bg-[#F2FCE2] pl-3 pr-2 py-1.5"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">All Users</span>
          </div>
        </SelectItem>
        {profiles.map(profile => {
          const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || 'U';
          return (
            <SelectItem 
              key={profile.id}
              value={profile.id}
              className="flex items-center gap-2 cursor-pointer hover:bg-[#F2FCE2] data-[state=checked]:bg-[#114742] data-[state=checked]:text-white focus:bg-[#F2FCE2] pl-3 pr-2 py-1.5"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{getUserDisplayName(profile)}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
