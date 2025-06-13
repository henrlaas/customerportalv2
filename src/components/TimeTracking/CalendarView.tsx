
import { useState } from 'react';
import { format, isWithinInterval, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TimeEntry, Task, Campaign, Project } from '@/types/timeTracking';
import { Company } from '@/types/company';
import { TimeEntryCard } from './TimeEntryCard';
import { CalendarViewSkeleton } from './CalendarViewSkeleton';
import { useMonthlyTimeEntries } from '@/hooks/useMonthlyTimeEntries';

type CalendarViewProps = {
  onEditEntry: (entry: TimeEntry) => void;
  onDeleteEntry: (entry: TimeEntry) => void;
  tasks: Task[];
  companies: Company[];
  campaigns: Campaign[];
  projects: Project[];
};

export const CalendarView = ({ 
  onEditEntry, 
  onDeleteEntry,
  tasks,
  companies,
  campaigns,
  projects
}: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Fetch time entries for the current month being viewed
  const { data: timeEntries = [], isLoading } = useMonthlyTimeEntries(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    true // Always enabled since we want to fetch data for the viewed month
  );
  
  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
    // Clear selected date if it's not in the new month
    setSelectedDate(prev => {
      if (prev && !isSameDay(prev, subMonths(currentMonth, 1))) {
        const newMonth = subMonths(currentMonth, 1);
        if (prev.getMonth() !== newMonth.getMonth() || prev.getFullYear() !== newMonth.getFullYear()) {
          return undefined;
        }
      }
      return prev;
    });
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
    // Clear selected date if it's not in the new month
    setSelectedDate(prev => {
      if (prev && !isSameDay(prev, addMonths(currentMonth, 1))) {
        const newMonth = addMonths(currentMonth, 1);
        if (prev.getMonth() !== newMonth.getMonth() || prev.getFullYear() !== newMonth.getFullYear()) {
          return undefined;
        }
      }
      return prev;
    });
  };

  const handleTodayClick = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  if (isLoading) {
    return <CalendarViewSkeleton />;
  }

  // Get entries for selected date
  const selectedDateEntries = selectedDate 
    ? timeEntries.filter(entry => {
        const entryDate = parseISO(entry.start_time);
        return isSameDay(entryDate, selectedDate);
      })
    : [];
  
  // Find days that have entries for the current month being viewed
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysWithEntries = timeEntries.reduce<Record<string, boolean>>((acc, entry) => {
    const entryDate = parseISO(entry.start_time);
    if (isWithinInterval(entryDate, { start: monthStart, end: monthEnd })) {
      const dateString = format(entryDate, 'yyyy-MM-dd');
      acc[dateString] = true;
    }
    return acc;
  }, {});
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar column - Fixed height */}
        <Card className="lg:col-span-1 h-[500px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between flex-shrink-0 pb-4">
            <CardTitle className="text-lg font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleTodayClick}
              >
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center p-2">
            <Calendar
              mode="single"
              month={currentMonth}
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="w-full max-w-none"
              modifiers={{
                hasEntry: (date) => {
                  const dateString = format(date, 'yyyy-MM-dd');
                  return !!daysWithEntries[dateString];
                }
              }}
              modifiersClassNames={{
                hasEntry: "border-2 border-primary text-primary font-semibold"
              }}
            />
          </CardContent>
        </Card>
        
        {/* Entries list column */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date to view entries'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEntries.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEntries.map((entry) => (
                  <TimeEntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={onEditEntry}
                    onDelete={onDeleteEntry}
                    tasks={tasks}
                    companies={companies}
                    campaigns={campaigns}
                    projects={projects}
                    highlighted
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {selectedDate 
                  ? 'No time entries for this date.' 
                  : 'Select a date to view entries.'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
