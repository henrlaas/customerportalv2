
import { useState } from 'react';
import { format, isSameMonth } from 'date-fns';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TimeEntryCard } from './TimeEntryCard';
import { MonthlyTimeEntrySkeleton } from './MonthlyTimeEntrySkeleton';
import { useMonthlyTimeEntries } from '@/hooks/useMonthlyTimeEntries';
import { TimeEntry, Task, Campaign, Project } from '@/types/timeTracking';
import { Company } from '@/types/company';

type MonthlyTimeEntrySectionProps = {
  year: number;
  month: number;
  isCurrentMonth: boolean;
  tasks: Task[];
  companies: Company[];
  campaigns: Campaign[];
  projects: Project[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entry: TimeEntry) => void;
  searchQuery?: string;
  currentMonthEntries?: TimeEntry[];
};

export const MonthlyTimeEntrySection = ({
  year,
  month,
  isCurrentMonth,
  tasks,
  companies,
  campaigns,
  projects,
  onEdit,
  onDelete,
  searchQuery = '',
  currentMonthEntries = []
}: MonthlyTimeEntrySectionProps) => {
  const [isOpen, setIsOpen] = useState(isCurrentMonth);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(isCurrentMonth);

  // Use current month entries if this is the current month, otherwise fetch on demand
  const { data: timeEntries = [], isLoading } = useMonthlyTimeEntries(
    year, 
    month, 
    !isCurrentMonth && hasLoadedOnce
  );

  const entries = isCurrentMonth ? currentMonthEntries : timeEntries;

  // Filter entries by search query
  const filteredEntries = entries.filter(entry => 
    entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.task_id && tasks.find(task => task.id === entry.task_id)?.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (entry.company_id && companies.find(company => company.id === entry.company_id)?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (entry.campaign_id && campaigns.find(campaign => campaign.id === entry.campaign_id)?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (entry.project_id && projects.find(project => project.id === entry.project_id)?.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const monthDate = new Date(year, month - 1, 1);
  const monthTitle = format(monthDate, 'MMMM yyyy');
  
  // Calculate total hours for the month
  const totalHours = filteredEntries.reduce((total, entry) => {
    if (entry.end_time) {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }
    return total;
  }, 0);

  const handleToggle = () => {
    if (!isCurrentMonth && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
    setIsOpen(!isOpen);
  };

  const showEntries = isCurrentMonth || hasLoadedOnce;

  return (
    <Collapsible open={isOpen} onOpenChange={handleToggle}>
      <Card className="shadow-sm">
        <CollapsibleTrigger asChild>
          <CardHeader className="py-3 px-6 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
            <Button variant="ghost" className="w-full justify-between p-0 h-auto text-left">
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <h3 className="text-sm font-medium">
                  {isCurrentMonth ? 'This month' : monthTitle}
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{filteredEntries.length} entries</span>
                <span>{totalHours.toFixed(1)}h total</span>
              </div>
            </Button>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="p-3">
            {!showEntries ? (
              <div className="text-center py-4 text-muted-foreground">
                Click to load entries for {monthTitle}
              </div>
            ) : isLoading ? (
              <MonthlyTimeEntrySkeleton />
            ) : filteredEntries.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                {searchQuery ? 'No entries found matching your search.' : 'No time entries found for this month.'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEntries.map(entry => (
                  <TimeEntryCard 
                    key={entry.id} 
                    entry={entry} 
                    tasks={tasks}
                    companies={companies}
                    campaigns={campaigns}
                    projects={projects}
                    onEdit={onEdit} 
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
