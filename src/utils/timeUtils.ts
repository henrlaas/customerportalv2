
import { formatDistance, differenceInSeconds } from 'date-fns';

// Format duration
export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};

// Calculate duration between start and end time
export const calculateDuration = (start: string, end: string | null) => {
  if (!end) return 'In progress';
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  const seconds = differenceInSeconds(endDate, startDate);
  
  return formatDuration(seconds);
};
