
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { TimeEntry, Task } from '@/types/timeTracking';
import { TimeTrackerHeader } from '@/components/TimeTracking/TimeTrackerHeader';
import { TimeEntrySearch } from '@/components/TimeTracking/TimeEntrySearch';
import { TimeEntryList } from '@/components/TimeTracking/TimeEntryList';
import { TimeEntryForm } from '@/components/TimeTracking/TimeEntryForm';

const TimeTrackingPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch time entries
  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });
      
      if (error) {
        toast({
          title: 'Error fetching time entries',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      // Check if there's any active time entry (without end_time)
      const active = data.find(entry => !entry.end_time);
      if (active) {
        setIsTracking(true);
        setActiveEntry(active);
      }
      
      return data as TimeEntry[];
    },
    enabled: !!user,
  });
  
  // Fetch tasks for the dropdown
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: 'Error fetching tasks',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Task[];
    },
  });
  
  // Edit time entry
  const handleEdit = (entry: TimeEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };
  
  // Reset current entry and close edit dialog
  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentEntry(null);
  };

  // Update elapsed time for active time entry
  useEffect(() => {
    if (!isTracking || !activeEntry) return;
    
    const interval = setInterval(() => {
      const start = new Date(activeEntry.start_time).getTime();
      const now = new Date().getTime();
      setElapsedTime(Math.floor((now - start) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isTracking, activeEntry]);
  
  // Filter entries by search query
  const filteredEntries = timeEntries.filter(entry => 
    entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.task_id && tasks.find(task => task.id === entry.task_id)?.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="container mx-auto p-6">
      <TimeTrackerHeader
        isTracking={isTracking}
        elapsedTime={elapsedTime}
        activeEntry={activeEntry}
        setIsTracking={setIsTracking}
        setActiveEntry={setActiveEntry}
      />
      
      <TimeEntrySearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <TimeEntryList
        timeEntries={filteredEntries}
        isLoading={isLoading}
        tasks={tasks}
        onEdit={handleEdit}
      />
      
      {/* Edit Time Entry Dialog */}
      <TimeEntryForm
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        currentEntry={currentEntry}
        onCancelEdit={handleCancelEdit}
        tasks={tasks}
      />
    </div>
  );
};

export default TimeTrackingPage;
