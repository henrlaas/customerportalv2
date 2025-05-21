
import React from 'react';
import { TimeEntry, Task, Campaign, Project } from '@/types/timeTracking';
import { Company } from '@/types/company';
import { TimeEntryCard } from './TimeEntryCard';

interface TimeEntryListProps {
  timeEntries: TimeEntry[];
  isLoading: boolean;
  tasks: Task[];
  companies: Company[];
  campaigns: Campaign[];
  projects?: Project[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entry: TimeEntry) => void;
}

export function TimeEntryList({
  timeEntries,
  isLoading,
  tasks,
  companies,
  campaigns,
  projects = [],
  onEdit,
  onDelete,
}: TimeEntryListProps) {
  // Get company name based on company_id
  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return "";
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : "";
  };
  
  // Get task title based on task_id
  const getTaskTitle = (taskId: string | null) => {
    if (!taskId) return "";
    const task = tasks.find(t => t.id === taskId);
    return task ? task.title : "";
  };

  // Get campaign name based on campaign_id
  const getCampaignName = (campaignId: string | null) => {
    if (!campaignId) return "";
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign ? campaign.name : "";
  };
  
  // Get project name based on project_id
  const getProjectName = (projectId: string | null) => {
    if (!projectId) return "";
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "";
  };

  // Calculate duration between start_time and end_time in hours and minutes
  const getDuration = (startTime: string, endTime: string | null): string => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const diffInMs = end - start;
    
    // Format as hours and minutes
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes}m`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };
  
  // Group time entries by date
  const groupedEntries = timeEntries.reduce<Record<string, TimeEntry[]>>((groups, entry) => {
    const date = new Date(entry.start_time).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {});

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (timeEntries.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No time entries found</h3>
        <p className="text-muted-foreground mt-2">
          Start tracking time or adjust your search filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 my-6">
      {Object.entries(groupedEntries).map(([date, entries]) => (
        <div key={date} className="space-y-2">
          <h3 className="text-sm font-medium sticky top-0 bg-background/90 backdrop-blur-sm py-2 z-10">
            {new Date(date).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          <div className="space-y-3">
            {entries.map(entry => (
              <TimeEntryCard
                key={entry.id}
                entry={entry}
                duration={getDuration(entry.start_time, entry.end_time)}
                companyName={getCompanyName(entry.company_id)}
                taskTitle={getTaskTitle(entry.task_id)}
                campaignName={getCampaignName(entry.campaign_id)}
                projectName={getProjectName(entry.project_id)}
                onEdit={() => onEdit(entry)}
                onDelete={() => onDelete(entry)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
