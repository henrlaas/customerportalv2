
import React from 'react';
import Select from 'react-select';
import {
  Select as UISelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
  role: string;
};

type Campaign = {
  id: string;
  name: string;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
};

type FiltersType = {
  status: string;
  priority: string;
  search: string;
  assignee: string;
  campaign: string;
  showOnlyMyTasks: boolean;
};

interface TaskFiltersProps {
  filters: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
  profiles: Contact[];
  campaigns: Campaign[];
  projects?: Project[];
  currentUserId: string;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  setFilters,
  profiles,
  campaigns,
  projects = [],
  currentUserId,
}) => {
  const handleFilterChange = (key: keyof FiltersType, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Utility functions for react-select
  const getUserDisplayName = (user: Contact) => {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User';
  };

  const getInitials = (user: Contact) => {
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Format users for react-select
  const userOptions = [
    { value: 'all', label: 'All assignees', isDefault: true },
    ...profiles.map(user => ({
      value: user.id,
      label: getUserDisplayName(user),
      user
    }))
  ];

  // Find the selected user option
  const selectedUserOption = userOptions.find(option => option.value === filters.assignee) || userOptions[0];

  // Combine campaigns and projects for the filter
  const campaignProjectOptions = [
    { value: 'all', label: 'All campaigns & projects', isDefault: true },
    ...campaigns.map(campaign => ({
      value: `campaign_${campaign.id}`,
      label: campaign.name,
      type: 'campaign'
    })),
    ...projects.map(project => ({
      value: `project_${project.id}`,
      label: project.name,
      type: 'project'
    }))
  ];

  // Find the selected campaign/project option
  const selectedCampaignProjectOption = campaignProjectOptions.find(option => option.value === filters.campaign) || campaignProjectOptions[0];

  // Custom formatting for the user dropdown options
  const formatUserOptionLabel = (option: any) => {
    if (option.isDefault) {
      return <span>{option.label}</span>;
    }

    const user = option.user;
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="text-xs">{getInitials(user)}</AvatarFallback>
        </Avatar>
        <span>{getUserDisplayName(user)}</span>
        {user.id === currentUserId && <span className="text-muted-foreground text-sm">(Me)</span>}
      </div>
    );
  };

  // Custom formatting for campaign/project options
  const formatCampaignProjectOptionLabel = (option: any) => {
    if (option.isDefault) {
      return <span>{option.label}</span>;
    }

    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={
          option.type === 'campaign' 
            ? "bg-purple-100 text-purple-800 border-purple-200" 
            : "bg-blue-100 text-blue-800 border-blue-200"
        }>
          {option.type === 'campaign' ? 'Campaign' : 'Project'}
        </Badge>
        <span>{option.label}</span>
      </div>
    );
  };

  // Status options with colors
  const StatusSelect = () => (
    <UISelect value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
      <SelectTrigger>
        <SelectValue placeholder="All statuses" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All statuses</SelectItem>
        <SelectItem value="todo">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Todo</Badge>
          </div>
        </SelectItem>
        <SelectItem value="in_progress">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>
          </div>
        </SelectItem>
        <SelectItem value="completed">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
          </div>
        </SelectItem>
      </SelectContent>
    </UISelect>
  );

  // Priority options with colors
  const PrioritySelect = () => (
    <UISelect value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
      <SelectTrigger>
        <SelectValue placeholder="All priorities" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All priorities</SelectItem>
        <SelectItem value="low">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Low</Badge>
          </div>
        </SelectItem>
        <SelectItem value="medium">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
          </div>
        </SelectItem>
        <SelectItem value="high">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">High</Badge>
          </div>
        </SelectItem>
      </SelectContent>
    </UISelect>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-x-2 pb-2 border-b">
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-my-tasks" 
            checked={filters.showOnlyMyTasks}
            onCheckedChange={(checked) => handleFilterChange('showOnlyMyTasks', checked)}
          />
          <Label htmlFor="show-my-tasks" className="cursor-pointer">Show only my tasks</Label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <StatusSelect />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Priority</label>
          <PrioritySelect />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Assignee</label>
          <Select
            options={userOptions}
            value={selectedUserOption}
            onChange={(option) => handleFilterChange('assignee', option?.value || 'all')}
            formatOptionLabel={formatUserOptionLabel}
            placeholder="All assignees"
            isSearchable
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
                  ? 'hsl(var(--accent))' 
                  : isSelected 
                    ? 'hsl(var(--accent) / 0.2)'
                    : undefined,
                color: 'hsl(var(--foreground))'
              }),
              input: (baseStyles) => ({
                ...baseStyles,
                color: 'hsl(var(--foreground))'
              }),
              singleValue: (baseStyles) => ({
                ...baseStyles,
                color: 'hsl(var(--foreground))'
              })
            }}
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Campaign/Project</label>
          <Select
            options={campaignProjectOptions}
            value={selectedCampaignProjectOption}
            onChange={(option) => handleFilterChange('campaign', option?.value || 'all')}
            formatOptionLabel={formatCampaignProjectOptionLabel}
            placeholder="All campaigns & projects"
            isSearchable
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
                  ? 'hsl(var(--accent))' 
                  : isSelected 
                    ? 'hsl(var(--accent) / 0.2)'
                    : undefined,
                color: 'hsl(var(--foreground))'
              }),
              input: (baseStyles) => ({
                ...baseStyles,
                color: 'hsl(var(--foreground))'
              }),
              singleValue: (baseStyles) => ({
                ...baseStyles,
                color: 'hsl(var(--foreground))'
              })
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
