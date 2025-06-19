
import React from 'react';
import { Calendar, CheckSquare, Megaphone } from 'lucide-react';

interface CalendarEventItemProps {
  type: 'task' | 'project' | 'campaign';
  title: string;
  id: string;
  priority?: string;
  platform?: string;
  onClick: () => void;
}

export const CalendarEventItem: React.FC<CalendarEventItemProps> = ({
  type,
  title,
  priority,
  platform,
  onClick,
}) => {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEventStyle = () => {
    if (type === 'project') {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    if (type === 'campaign') {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    return getPriorityColor(priority);
  };

  const getIcon = () => {
    if (type === 'project') return Calendar;
    if (type === 'campaign') return Megaphone;
    return CheckSquare;
  };

  const Icon = getIcon();

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-1 p-1 rounded border text-xs cursor-pointer hover:opacity-80 transition-opacity ${getEventStyle()}`}
      title={`${title}${platform ? ` (${platform})` : ''}`}
    >
      <Icon className="h-3 w-3 flex-shrink-0" />
      <span className="truncate flex-1">{title}</span>
    </div>
  );
};
