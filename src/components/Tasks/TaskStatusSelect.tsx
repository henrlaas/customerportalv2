
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskStatusSelectProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export const TaskStatusSelect: React.FC<TaskStatusSelectProps> = ({
  selectedStatus,
  onStatusChange,
}) => {
  const statusOptions = [
    { value: 'all', label: 'All statuses', color: '#6B7280' },
    { value: 'todo', label: 'Todo', bgColor: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-gray-200' },
    { value: 'in_progress', label: 'In Progress', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-200' },
    { value: 'completed', label: 'Completed', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-200' },
  ];

  const selectedOption = statusOptions.find(option => option.value === selectedStatus) || statusOptions[0];
  const isAll = selectedStatus === 'all';

  return (
    <Select value={selectedStatus} onValueChange={onStatusChange}>
      <SelectTrigger className={`w-[140px] h-10 border ${
        isAll 
          ? 'bg-background text-foreground border-input' 
          : `${selectedOption.bgColor} ${selectedOption.textColor} ${selectedOption.borderColor}`
      }`}>
        <SelectValue>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: isAll ? '#6B7280' : selectedOption.color || '#6B7280' }}
            />
            <span className="text-sm font-medium truncate">
              {selectedOption.label}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-background border border-border z-50 min-w-[140px]">
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value} className="cursor-pointer hover:bg-accent/50">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: option.color || '#6B7280' }}
              />
              <span className="text-sm">{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
