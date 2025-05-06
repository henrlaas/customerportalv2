
import { TimeEntryCard } from './TimeEntryCard';
import { TimeEntry, Task, Campaign } from '@/types/timeTracking';
import { Company } from '@/types/company'; // Import the full Company type

type TimeEntryListProps = {
  timeEntries: TimeEntry[];
  isLoading: boolean;
  tasks: Task[];
  companies: Company[]; // Update to use the full Company type
  campaigns: Campaign[];
  onEdit: (entry: TimeEntry) => void;
};

export const TimeEntryList = ({ 
  timeEntries, 
  isLoading, 
  tasks,
  companies,
  campaigns,
  onEdit
}: TimeEntryListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (timeEntries.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 rounded-xl bg-muted/50 shadow-[rgba(145,158,171,0.2)_0px_0px_2px_0px,rgba(145,158,171,0.12)_0px_12px_24px_-4px]">
        No time entries found. Start tracking your time or add a manual entry.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {timeEntries.map(entry => (
        <TimeEntryCard 
          key={entry.id} 
          entry={entry} 
          tasks={tasks}
          companies={companies}
          campaigns={campaigns}
          onEdit={onEdit} 
        />
      ))}
    </div>
  );
};
