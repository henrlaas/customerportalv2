
import { TimeEntryCard } from './TimeEntryCard';
import { TimeEntry, Task } from '@/types/timeTracking';

type TimeEntryListProps = {
  timeEntries: TimeEntry[];
  isLoading: boolean;
  tasks: Task[];
  onEdit: (entry: TimeEntry) => void;
};

export const TimeEntryList = ({ 
  timeEntries, 
  isLoading, 
  tasks,
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
      <div className="text-center p-8 text-gray-500">
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
          onEdit={onEdit} 
        />
      ))}
    </div>
  );
};
