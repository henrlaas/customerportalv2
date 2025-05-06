
import { format, formatDistance } from 'date-fns';
import { Calendar, Clock, Pencil, Building, Tag, Briefcase, DollarSign, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimeEntry, Task, Campaign } from '@/types/timeTracking';
import { Company } from '@/types/company';

type TimeEntryCardProps = {
  entry: TimeEntry;
  tasks: Task[];
  companies: Company[];
  campaigns: Campaign[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entry: TimeEntry) => void;
  highlighted?: boolean;
};

export const TimeEntryCard = ({ 
  entry, 
  tasks, 
  companies, 
  campaigns, 
  onEdit,
  onDelete,
  highlighted = false
}: TimeEntryCardProps) => {
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
    // For ongoing time tracking, show continuous updating
    duration = 'In progress';
  }
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium truncate mb-1">
              {entry.description || 'No description'}
            </h3>
            
            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
              {company && (
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  <span>{company.name}</span>
                </div>
              )}
              
              {campaign && (
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>{campaign.name}</span>
                </div>
              )}
              
              {task && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{task.title}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(entry)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(entry)} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {format(startTime, 'dd MMM yyyy')}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {format(startTime, 'HH:mm')} - {endTime ? format(endTime, 'HH:mm') : 'ongoing'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium">
              {duration}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="w-full flex justify-between">
          <Badge variant={entry.is_billable ? "default" : "outline"} className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {entry.is_billable ? 'Billable' : 'Non-billable'}
          </Badge>
          
          <span className="text-xs text-gray-500">
            {endTime && `Added ${formatDistance(endTime, new Date(), { addSuffix: true })}`}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};
