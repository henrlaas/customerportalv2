
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, parseISO, differenceInHours, differenceInMinutes } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimeEntry } from '@/types/timeTracking';

type CalendarViewProps = {
  timeEntries: TimeEntry[];
  onEditEntry: (entry: TimeEntry) => void;
};

export const CalendarView = ({ timeEntries, onEditEntry }: CalendarViewProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const getDayEntries = (day: Date) => {
    return timeEntries.filter(entry => 
      isSameDay(parseISO(entry.start_time), day)
    );
  };

  const getTotalHoursForDay = (day: Date): string => {
    const entries = getDayEntries(day);
    if (entries.length === 0) return '';
    
    let totalMinutes = 0;
    
    entries.forEach(entry => {
      const start = parseISO(entry.start_time);
      const end = entry.end_time ? parseISO(entry.end_time) : new Date();
      totalMinutes += differenceInMinutes(end, start);
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="w-full"
          modifiers={{
            hasEntries: (date) => getDayEntries(date).length > 0
          }}
          modifiersStyles={{
            hasEntries: { backgroundColor: '#f0f9ff', fontWeight: 'bold' }
          }}
          components={{
            DayContent: (props) => (
              <div className="flex flex-col items-center">
                <span>{props.date.getDate()}</span>
                {getTotalHoursForDay(props.date) && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {getTotalHoursForDay(props.date)}
                  </Badge>
                )}
              </div>
            ),
          }}
        />
      </div>

      {date && (
        <div>
          <h3 className="text-lg font-medium mb-4">
            Entries for {format(date, 'MMMM d, yyyy')}
          </h3>
          
          <div className="space-y-4">
            {getDayEntries(date).length === 0 ? (
              <div className="text-center p-8 text-gray-500 rounded-xl bg-muted/50">
                No entries for this date.
              </div>
            ) : (
              getDayEntries(date).map(entry => {
                const start = parseISO(entry.start_time);
                const end = entry.end_time ? parseISO(entry.end_time) : new Date();
                const hours = differenceInHours(end, start);
                const minutes = differenceInMinutes(end, start) % 60;
                
                return (
                  <Card 
                    key={entry.id} 
                    className="bg-white cursor-pointer hover:bg-gray-50"
                    onClick={() => onEditEntry(entry)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{entry.description || 'Time entry'}</h4>
                          <div className="text-sm text-gray-500">
                            {format(start, 'HH:mm')} - {entry.end_time ? format(end, 'HH:mm') : 'In progress'}
                          </div>
                        </div>
                        <Badge variant={entry.is_billable ? "default" : "outline"}>
                          {hours}h {minutes}m
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
