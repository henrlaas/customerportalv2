
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserRound } from 'lucide-react';

type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
};

type Campaign = {
  id: string;
  name: string;
};

type FiltersType = {
  status: string;
  priority: string;
  search: string;
  assignee: string;
  creator: string;
  campaign: string;
};

interface TaskFiltersProps {
  filters: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
  profiles: Contact[];
  campaigns: Campaign[];
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  setFilters,
  profiles,
  campaigns,
}) => {
  const handleFilterChange = (key: keyof FiltersType, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Helper function to get initials from name
  const getInitials = (firstName: string | null, lastName: string | null) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  // Helper function to get full name
  const getFullName = (profile: Contact) => {
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User';
  };

  // Custom content for the SelectTrigger for profiles - now only showing avatars
  const renderUserSelectTrigger = (selectedId: string, label: string) => {
    if (selectedId === 'all') {
      return (
        <div className="flex items-center gap-2">
          <span>All {label}</span>
        </div>
      );
    }

    const selectedUser = profiles.find(profile => profile.id === selectedId);
    
    if (!selectedUser) {
      return (
        <div className="flex items-center gap-2">
          <span>Select {label}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center">
        <Avatar className="h-6 w-6">
          {selectedUser.avatar_url ? (
            <AvatarImage src={selectedUser.avatar_url} alt={getFullName(selectedUser)} />
          ) : (
            <AvatarFallback className="bg-purple-100 text-purple-800 text-xs">
              {getInitials(selectedUser.first_name, selectedUser.last_name)}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <Select 
          value={filters.status} 
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Priority</label>
        <Select 
          value={filters.priority} 
          onValueChange={(value) => handleFilterChange('priority', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Assignees</label>
        <Select 
          value={filters.assignee} 
          onValueChange={(value) => handleFilterChange('assignee', value)}
        >
          <SelectTrigger>
            {renderUserSelectTrigger(filters.assignee, 'assignees')}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assignees</SelectItem>
            {profiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    {profile.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={getFullName(profile)} />
                    ) : (
                      <AvatarFallback className="bg-purple-100 text-purple-800 text-xs">
                        {getInitials(profile.first_name, profile.last_name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span>{getFullName(profile)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Creator</label>
        <Select 
          value={filters.creator} 
          onValueChange={(value) => handleFilterChange('creator', value)}
        >
          <SelectTrigger>
            {renderUserSelectTrigger(filters.creator, 'creator')}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All creators</SelectItem>
            {profiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    {profile.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={getFullName(profile)} />
                    ) : (
                      <AvatarFallback className="bg-purple-100 text-purple-800 text-xs">
                        {getInitials(profile.first_name, profile.last_name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span>{getFullName(profile)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Campaign</label>
        <Select 
          value={filters.campaign} 
          onValueChange={(value) => handleFilterChange('campaign', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All campaigns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All campaigns</SelectItem>
            {campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TaskFilters;
