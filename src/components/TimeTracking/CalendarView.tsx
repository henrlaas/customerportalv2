
import { useState } from 'react';
import { format, isSameDay, isToday, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TimeEntry } from '@/types/timeTracking';

type CalendarViewProps = {
  timeEntries: TimeEntry[];
  onEditEntry: (entry: TimeEntry) => void;
};

export const CalendarView = ({ timeEntries, onEditEntry }: CalendarViewProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Group entries by date
  const entriesByDate = timeEntries.reduce((acc, entry) => {
    const date = format(parseISO(entry.start_time), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, TimeEntry[]>);
  
  // Custom renderer for days with entries
  const renderDay = (day: Date, modifiers: any) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    const hasEntries = !!entriesByDate[formattedDate];
    const dayEntries = entriesByDate[formattedDate] || [];
    const totalHours = dayEntries.reduce((total, entry) => {
      if (!entry.end_time) return total;
      const start = parseISO(entry.start_time);
      const end = parseISO(entry.end_time);
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + durationHours;
    }, 0);
    
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
            isToday(day)
              ? "bg-primary text-primary-foreground"
              : hasEntries
              ? "border border-primary"
              : ""
          }`}
        >
          {format(day, 'd')}
        </div>
        {hasEntries && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-0.5">
            <div className="h-1 w-1 rounded-full bg-primary" />
            {totalHours >= 4 && <div className="h-1 w-1 rounded-full bg-primary" />}
            {totalHours >= 8 && <div className="h-1 w-1 rounded-full bg-primary" />}
          </div>
        )}
      </div>
    );
  };
  
  // Show entries for selected date
  const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : '';
  const selectedEntries = date ? (entriesByDate[selectedDateStr] || []) : [];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-auto md:min-w-[320px]">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="border-none"
              components={{
                DayContent: ({ date: currentDate }) => renderDay(currentDate, {})
              }}
            />
          </CardContent>
        </Card>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              <span>
                {date && (
                  isToday(date) ? "Today" : format(date, 'MMMM d, yyyy')
                )}
              </span>
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (date) {
                    const prevDay = new Date(date);
                    prevDay.setDate(prevDay.getDate() - 1);
                    setDate(prevDay);
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (date) {
                    const nextDay = new Date(date);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setDate(nextDay);
                  }
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setDate(new Date())}
              >
                Today
              </Button>
            </div>
          </div>
          
          {selectedEntries.length === 0 ? (
            <div className="text-center p-8 text-gray-500 rounded-xl bg-muted/50 shadow-[rgba(145,158,171,0.2)_0px_0px_2px_0px,rgba(145,158,171,0.12)_0px_12px_24px_-4px]">
              No time entries for this date
            </div>
          ) : (
            <div className="space-y-4">
              {selectedEntries.map(entry => (
                <div 
                  key={entry.id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition"
                  onClick={() => onEditEntry(entry)}
                >
                  <div className="font-medium mb-1">
                    {entry.description || 'No description'}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center justify-between">
                    <div>
                      {format(parseISO(entry.start_time), 'HH:mm')} - {
                        entry.end_time 
                          ? format(parseISO(entry.end_time), 'HH:mm')
                          : 'ongoing'
                      }
                    </div>
                    <div className="font-mono">
                      {entry.end_time ? (
                        (() => {
                          const start = parseISO(entry.start_time);
                          const end = parseISO(entry.end_time);
                          const durationMs = end.getTime() - start.getTime();
                          const hours = Math.floor(durationMs / (1000 * 60 * 60));
                          const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        })()
                      ) : (
                        'In progress'
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
