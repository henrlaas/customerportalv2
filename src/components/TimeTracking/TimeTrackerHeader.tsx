
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Play, Pause, PlusCircle, List, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  ToggleGroup,
  ToggleGroupItem
} from '@/components/ui/toggle-group';
import { TimeEntryForm } from './TimeEntryForm';
import { formatDuration } from '@/utils/timeUtils';
import { ViewType } from '@/types/timeTracking';

type TimeTrackerHeaderProps = {
  isTracking: boolean;
  elapsedTime: number;
  activeEntry: any | null;
  setIsTracking: (value: boolean) => void;
  setActiveEntry: (entry: any | null) => void;
  view: ViewType;
  setView: (view: ViewType) => void;
};

export const TimeTrackerHeader = ({
  isTracking,
  elapsedTime,
  activeEntry,
  setIsTracking,
  setActiveEntry,
  view,
  setView
}: TimeTrackerHeaderProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Start time tracking
  const startTracking = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to track time.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([{
          user_id: user.id,
          start_time: new Date().toISOString(),
          description: 'Time tracking session',
          is_billable: true
        }])
        .select();
      
      if (error) throw error;
      
      setIsTracking(true);
      setActiveEntry(data[0]);
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      
      toast({
        title: 'Time tracking started',
        description: 'Your timer has started.',
      });
    } catch (error: any) {
      toast({
        title: 'Error starting timer',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Stop time tracking
  const stopTracking = async () => {
    if (!activeEntry) return;
    
    try {
      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: new Date().toISOString(),
        })
        .eq('id', activeEntry.id);
      
      if (error) throw error;
      
      setIsTracking(false);
      setActiveEntry(null);
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      
      toast({
        title: 'Time tracking stopped',
        description: 'Your timer has been stopped.',
      });
    } catch (error: any) {
      toast({
        title: 'Error stopping timer',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Time Tracking</h1>
        <div className="flex gap-2">
          {isTracking ? (
            <Button variant="destructive" onClick={stopTracking}>
              <Pause className="mr-2 h-4 w-4" />
              Stop ({formatDuration(elapsedTime)})
            </Button>
          ) : (
            <Button onClick={startTracking}>
              <Play className="mr-2 h-4 w-4" />
              Start Timer
            </Button>
          )}
          <TimeEntryForm 
            isCreating={isCreating}
            setIsCreating={setIsCreating} 
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as ViewType)}>
          <ToggleGroupItem value="list">
            <List className="h-4 w-4 mr-2" />
            List View
          </ToggleGroupItem>
          <ToggleGroupItem value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </ToggleGroupItem>
        </ToggleGroup>
        
        <Button variant="outline" onClick={() => setIsCreating(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Manual Entry
        </Button>
      </div>
    </div>
  );
};
