
import { useMemo } from 'react';
import { format, startOfWeek, parseISO, isThisWeek, differenceInWeeks } from 'date-fns';
import { TimeEntryCard } from './TimeEntryCard';
import { TimeEntry, Task, Campaign, Project } from '@/types/timeTracking';
import { Company } from '@/types/company';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type TimeEntryListProps = {
  timeEntries: TimeEntry[];
  isLoading: boolean;
  tasks: Task[];
  companies: Company[];
  campaigns: Campaign[];
  projects: Project[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entry: TimeEntry) => void;
};

export const TimeEntryList = ({ 
  timeEntries, 
  isLoading, 
  tasks,
  companies,
  campaigns,
  projects,
  onEdit,
  onDelete
}: TimeEntryListProps) => {
  // Group entries by week
  const entriesByWeek = useMemo(() => {
    const now = new Date();
    const grouped: Record<string, { 
      entries: TimeEntry[], 
      startDate: Date,
      isCurrentWeek: boolean,
      weekNumber: number
    }> = {};
    
    timeEntries.forEach(entry => {
      const entryDate = parseISO(entry.start_time);
      const weekStart = startOfWeek(entryDate, { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      const weekDiff = differenceInWeeks(now, weekStart);
      
      if (!grouped[weekKey]) {
        grouped[weekKey] = {
          entries: [],
          startDate: weekStart,
          isCurrentWeek: isThisWeek(entryDate, { weekStartsOn: 1 }),
          weekNumber: weekDiff
        };
      }
      
      grouped[weekKey].entries.push(entry);
    });
    
    // Sort the weeks
    return Object.values(grouped).sort((a, b) => a.startDate > b.startDate ? -1 : 1);
  }, [timeEntries]);

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
    <div className="space-y-6">
      {entriesByWeek.map((weekGroup, index) => {
        const weekNumber = weekGroup.weekNumber;
        let weekTitle;
        
        if (weekGroup.isCurrentWeek) {
          weekTitle = "This week";
        } else if (weekNumber === 1) {
          weekTitle = "Last week";
        } else {
          weekTitle = `${format(weekGroup.startDate, 'MMMM d')} - ${format(
            new Date(weekGroup.startDate.getTime() + 6 * 24 * 60 * 60 * 1000),
            'MMMM d'
          )}`;
        }
        
        return (
          <Card key={index} className="shadow-sm">
            <CardHeader className="py-2 px-6 bg-muted/30">
              <h3 className="text-sm font-medium">{weekTitle}</h3>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {weekGroup.entries.map(entry => (
                <TimeEntryCard 
                  key={entry.id} 
                  entry={entry} 
                  tasks={tasks}
                  companies={companies}
                  campaigns={campaigns}
                  projects={projects}
                  onEdit={onEdit} 
                  onDelete={onDelete}
                  className="animate-enter"
                />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
