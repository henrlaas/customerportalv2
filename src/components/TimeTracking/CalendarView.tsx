
import { useState } from 'react';
import { format, isSameDay, isToday, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Building, Briefcase, Tag, DollarSign, Pencil, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TimeEntry, Task, Campaign } from '@/types/timeTracking';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/types/company';

type CalendarViewProps = {
  timeEntries: TimeEntry[];
  onEditEntry: (entry: TimeEntry) => void;
  onDeleteEntry: (entry: TimeEntry) => void;
  tasks: Task[];
  companies: Company[];
  campaigns: Campaign[];
};

export const CalendarView = ({ 
  timeEntries, 
  onEditEntry,
  onDeleteEntry,
  tasks, 
  companies, 
  campaigns 
}: CalendarViewProps) => {
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
        
        <div className="flex-1 flex flex-col">
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
          
          <Card className="flex-grow">
            <CardContent className="p-0">
              <ScrollArea className="h-[460px] p-4">
                {selectedEntries.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    No time entries for this date
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedEntries.map(entry => {
                      // Find related data
                      const task = entry.task_id ? tasks.find(t => t.id === entry.task_id) : null;
                      const company = entry.company_id ? companies.find(c => c.id === entry.company_id) : null;
                      const campaign = entry.campaign_id ? campaigns.find(c => c.id === entry.campaign_id) : null;
                      
                      // Format times and calculate duration
                      const startTime = new Date(entry.start_time);
                      const endTime = entry.end_time ? new Date(entry.end_time) : null;
                      
                      let duration = '-- : --';
                      if (endTime) {
                        const durationMs = endTime.getTime() - startTime.getTime();
                        const hours = Math.floor(durationMs / (1000 * 60 * 60));
                        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                        duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                      } else {
                        duration = 'In progress';
                      }
                      
                      return (
                        <Card key={entry.id} className="shadow-sm hover:shadow-md transition-shadow">
                          <div className="p-3">
                            <div className="flex items-center justify-between">
                              {/* Left side - Task description and metadata */}
                              <div className="flex-grow mr-4">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="text-sm font-medium truncate">
                                    {entry.description || 'No description'}
                                  </h3>
                                </div>
                                
                                <div className="flex flex-wrap items-center text-xs text-gray-500 gap-2">
                                  {company && (
                                    <div className="flex items-center gap-1">
                                      <Building className="h-3 w-3" />
                                      <span className="truncate max-w-[80px]">{company.name}</span>
                                    </div>
                                  )}
                                  
                                  {campaign && (
                                    <div className="flex items-center gap-1">
                                      <Tag className="h-3 w-3" />
                                      <span className="truncate max-w-[80px]">{campaign.name}</span>
                                    </div>
                                  )}
                                  
                                  {task && (
                                    <div className="flex items-center gap-1">
                                      <Briefcase className="h-3 w-3" />
                                      <span className="truncate max-w-[80px]">{task.title}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Center - Badge always vertically centered */}
                              <div className="flex items-center self-center mx-3">
                                <Badge 
                                  variant={entry.is_billable ? "default" : "outline"} 
                                  className={`flex items-center gap-1 text-xs ${entry.is_billable ? 'bg-green-700 hover:bg-green-800' : ''}`}
                                >
                                  <DollarSign className="h-2.5 w-2.5" />
                                  {entry.is_billable ? 'Billable' : 'Non-billable'}
                                </Badge>
                              </div>
                              
                              {/* Middle - Date and time information */}
                              <div className="flex items-center gap-4 mr-4">
                                <div className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                                  <Clock className="h-3 w-3 text-gray-500" />
                                  <span>
                                    {format(startTime, 'HH:mm')} - {endTime ? format(endTime, 'HH:mm') : 'ongoing'}
                                  </span>
                                </div>
                                
                                <div className="font-mono text-xs font-medium whitespace-nowrap">
                                  {duration}
                                </div>
                              </div>
                              
                              {/* Right side - Actions */}
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditEntry(entry)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDeleteEntry(entry)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
