
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
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
  campaign: string;
  showOnlyMyTasks: boolean;
};

interface TaskFiltersProps {
  filters: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
  profiles: Contact[];
  campaigns: Campaign[];
  currentUserId: string;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  setFilters,
  profiles,
  campaigns,
  currentUserId,
}) => {
  const handleFilterChange = (key: keyof FiltersType, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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
          <label className="text-sm font-medium text-gray-700">Assignee</label>
          <Select 
            value={filters.assignee} 
            onValueChange={(value) => handleFilterChange('assignee', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User'}
                  {profile.id === currentUserId ? ' (Me)' : ''}
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
    </div>
  );
};

export default TaskFilters;
