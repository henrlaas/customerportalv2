
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Edit, Trash2, Calendar, Clock, Tag, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Task, TimeEntry, Company, Campaign } from '@/types/timeTracking';
import { calculateDuration } from '@/utils/timeUtils';

type TimeEntryCardProps = {
  entry: TimeEntry;
  tasks: Task[];
  companies: Company[];
  campaigns: Campaign[];
  onEdit: (entry: TimeEntry) => void;
};

export const TimeEntryCard = ({ 
  entry, 
  tasks, 
  companies,
  campaigns,
  onEdit 
}: TimeEntryCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Delete time entry
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Time entry deleted',
        description: 'Your time entry has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    } catch (error: any) {
      toast({
        title: 'Error deleting time entry',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Get company name
  const company = entry.company_id ? companies.find(c => c.id === entry.company_id) : null;
  
  // Get campaign name
  const campaign = entry.campaign_id ? campaigns.find(c => c.id === entry.campaign_id) : null;

  return (
    <Card key={entry.id} className="bg-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            {entry.description || 'Time entry'}
          </CardTitle>
          <div className="flex space-x-1">
            <Button size="icon" variant="ghost" onClick={() => onEdit(entry)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => handleDelete(entry.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Start Time</div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              {format(new Date(entry.start_time), 'MMM d, yyyy HH:mm')}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">End Time</div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              {entry.end_time 
                ? format(new Date(entry.end_time), 'MMM d, yyyy HH:mm')
                : 'In progress'}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-sm text-gray-500">Duration</div>
          <div className="flex items-center font-medium">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            {entry.end_time 
              ? calculateDuration(entry.start_time, entry.end_time)
              : 'In progress'}
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={entry.is_billable ? "default" : "outline"}>
            {entry.is_billable ? 'Billable' : 'Non-Billable'}
          </Badge>
          
          {company && (
            <Badge variant="secondary" className="flex items-center">
              <Briefcase className="h-3 w-3 mr-1" />
              {company.name}
            </Badge>
          )}
          
          {campaign && (
            <Badge variant="secondary" className="flex items-center">
              <Tag className="h-3 w-3 mr-1" />
              {campaign.name}
            </Badge>
          )}
          
          {entry.task_id && (
            <Badge variant="secondary">
              {tasks.find(task => task.id === entry.task_id)?.title || 'Unknown task'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
