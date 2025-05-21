
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Clock, 
  Briefcase, 
  ClipboardList, 
  Megaphone,
  FileText,
  Building
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TimeEntry } from '@/types/timeTracking';
import { Badge } from '@/components/ui/badge';

interface TimeEntryCardProps {
  entry: TimeEntry;
  duration: string;
  companyName: string;
  taskTitle: string;
  campaignName: string;
  projectName?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function TimeEntryCard({
  entry,
  duration,
  companyName,
  taskTitle,
  campaignName,
  projectName = '',
  onEdit,
  onDelete,
}: TimeEntryCardProps) {
  // Format time for display
  const formatTime = (dateString: string | null): string => {
    if (!dateString) return 'In progress';
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={`transition-all ${!entry.end_time ? 'border-primary border-2' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="font-medium">
              {entry.description || 'No description'}
              {!entry.end_time && (
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                  Running
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Clock className="mr-1 h-3 w-3" /> 
                {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
              </span>
              <span>•</span>
              <span>{duration}</span>
              {entry.is_billable && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    Billable
                  </Badge>
                </>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {companyName && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {companyName}
                </Badge>
              )}
              
              {projectName && (
                <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                  <Briefcase className="h-3 w-3" />
                  {projectName}
                </Badge>
              )}
              
              {taskTitle && (
                <Badge variant="outline" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200">
                  <ClipboardList className="h-3 w-3" />
                  {taskTitle}
                </Badge>
              )}
              
              {campaignName && (
                <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
                  <Megaphone className="h-3 w-3" />
                  {campaignName}
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
