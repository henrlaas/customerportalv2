
import { useMemo } from 'react';
import { MonthlyTimeEntrySection } from './MonthlyTimeEntrySection';
import { TimeEntryListSkeleton } from './TimeEntryListSkeleton';
import { TimeEntry, Task, Campaign, Project } from '@/types/timeTracking';
import { Company } from '@/types/company';

type TimeEntryListProps = {
  timeEntries: TimeEntry[];
  isLoading: boolean;
  tasks: Task[];
  companies: Company[];
  campaigns: Campaign[];
  projects: Project[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entry: TimeEntry) => void;
  searchQuery?: string;
};

export const TimeEntryList = ({ 
  timeEntries, 
  isLoading, 
  tasks,
  companies,
  campaigns,
  projects,
  onEdit,
  onDelete,
  searchQuery = ''
}: TimeEntryListProps) => {
  // Generate list of months to show (current month + last 11 months)
  const monthsToShow = useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        isCurrentMonth: i === 0
      });
    }
    
    return months;
  }, []);

  if (isLoading) {
    return <TimeEntryListSkeleton />;
  }

  return (
    <div className="space-y-4">
      {monthsToShow.map(({ year, month, isCurrentMonth }) => (
        <MonthlyTimeEntrySection
          key={`${year}-${month}`}
          year={year}
          month={month}
          isCurrentMonth={isCurrentMonth}
          tasks={tasks}
          companies={companies}
          campaigns={campaigns}
          projects={projects}
          onEdit={onEdit}
          onDelete={onDelete}
          searchQuery={searchQuery}
          currentMonthEntries={isCurrentMonth ? timeEntries : []}
        />
      ))}
    </div>
  );
};
