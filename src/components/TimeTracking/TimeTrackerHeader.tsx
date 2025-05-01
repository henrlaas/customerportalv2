
import { useState } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Pause } from 'lucide-react';
import { TimeEntry, Task } from '@/types/timeTracking';
import { formatDuration } from '@/utils/timeUtils';

interface TimeTrackerHeaderProps {
  isTracking: boolean;
  elapsedTime: number;
  activeEntry: TimeEntry | null;
  setIsTracking: (isTracking: boolean) => void;
  setActiveEntry: (entry: TimeEntry | null) => void;
  onStart: (taskId: string | null) => void;
  onStop: (description: string | null) => void;
  tasks: Task[];
}

export const TimeTrackerHeader = ({
  isTracking,
  elapsedTime,
  activeEntry,
  onStart,
  onStop,
  tasks,
}: TimeTrackerHeaderProps) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const handleStart = () => {
    onStart(selectedTaskId);
  };

  const handleStop = () => {
    onStop(description);
    setDescription('');
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            {!isTracking ? (
              <div className="flex flex-col md:flex-row gap-2">
                <Select value={selectedTaskId || ''} onValueChange={setSelectedTaskId}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No task</SelectItem>
                    {tasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleStart} className="flex-shrink-0">
                  <Play className="mr-2 h-4 w-4" />
                  Start Timer
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="text-3xl font-mono font-semibold md:mr-4">
                    {formatDuration(elapsedTime)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {activeEntry && activeEntry.task_id
                        ? `Working on: ${
                            tasks.find(t => t.id === activeEntry.task_id)?.title || 'Unknown task'
                          }`
                        : 'Timer running'}
                    </p>
                  </div>
                  <Button onClick={handleStop} className="bg-red-500 hover:bg-red-600">
                    <Pause className="mr-2 h-4 w-4" />
                    Stop Timer
                  </Button>
                </div>
                <Textarea
                  placeholder="What are you working on? (Optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTrackerHeader;
