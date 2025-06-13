
import { format, formatDistance, isSameMonth, isSameYear } from 'date-fns';
import { Calendar, Clock, Pencil, Building, Tag, Briefcase, DollarSign, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimeEntry, Task, Campaign, Project } from '@/types/timeTracking';
import { Company } from '@/types/company';

type TimeEntryCardProps = {
  entry: TimeEntry;
  tasks: Task[];
  companies: Company[];
  campaigns: Campaign[];
  projects: Project[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entry: TimeEntry) => void;
  highlighted?: boolean;
  className?: string;
};

export const TimeEntryCard = ({ 
  entry, 
  tasks, 
  companies, 
  campaigns, 
  projects,
  onEdit,
  onDelete,
  highlighted = false,
  className = ''
}: TimeEntryCardProps) => {
  // Find related data
  const task = entry.task_id ? tasks.find(t => t.id === entry.task_id) : null;
  const company = entry.company_id ? companies.find(c => c.id === entry.company_id) : null;
  const campaign = entry.campaign_id ? campaigns.find(c => c.id === entry.campaign_id) : null;
  const project = entry.project_id ? projects.find(p => p.id === entry.project_id) : null;
  
  // Format times and calculate duration
  const startTime = new Date(entry.start_time);
  const endTime = entry.end_time ? new Date(entry.end_time) : null;
  const currentDate = new Date();
  
  // Check if entry is from current month AND current year (more strict)
  const isCurrentMonth = isSameMonth(startTime, currentDate) && isSameYear(startTime, currentDate);
  
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
    <Card className={`shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Task description and metadata */}
          <div className="flex-grow mr-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-medium truncate">
                {entry.description || 'No description'}
              </h3>
            </div>
            
            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-3">
              {company && (
                <div className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[120px]">{company.name}</span>
                </div>
              )}
              
              {project && (
                <div className="flex items-center gap-1">
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[120px]">{project.name}</span>
                </div>
              )}
              
              {campaign && (
                <div className="flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[120px]">{campaign.name}</span>
                </div>
              )}
              
              {task && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[120px]">{task.title}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Center - Badge always vertically centered */}
          <div className="flex items-center self-center mx-3">
            <Badge 
              variant={entry.is_billable ? "default" : "outline"} 
              className={`flex items-center gap-1 ${entry.is_billable ? 'bg-green-700 hover:bg-green-800' : ''}`}
            >
              <DollarSign className="h-3 w-3" />
              {entry.is_billable ? 'Billable' : 'Non-billable'}
            </Badge>
          </div>
          
          {/* Middle - Date and time information */}
          <div className="flex items-center gap-6 mr-4">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
              <span>{format(startTime, 'dd MMM')}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
              <Clock className="h-3.5 w-3.5 text-gray-500" />
              <span>
                {format(startTime, 'HH:mm')} - {endTime ? format(endTime, 'HH:mm') : 'ongoing'}
              </span>
            </div>
            
            <div className="font-mono text-sm font-medium whitespace-nowrap">
              {duration}
            </div>
          </div>
          
          {/* Right side - Actions - Only edit and delete allowed for current month */}
          <div className="flex items-center gap-1">
            {isCurrentMonth && (
              <>
                <Button variant="ghost" size="icon" onClick={(e) => {
                  e.stopPropagation();
                  onEdit(entry);
                }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={(e) => {
                  e.stopPropagation();
                  onDelete(entry);
                }} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            {!isCurrentMonth && (
              <div className="text-xs text-gray-400 px-2">
                Historical entry
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
