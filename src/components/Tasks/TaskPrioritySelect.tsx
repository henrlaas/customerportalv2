
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskPrioritySelectProps {
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
}

export const TaskPrioritySelect: React.FC<TaskPrioritySelectProps> = ({
  selectedPriority,
  onPriorityChange,
}) => {
  const priorityOptions = [
    { value: 'all', label: 'All priorities', color: '#6B7280' },
    { value: 'low', label: 'Low', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-200', color: '#166534' },
    { value: 'medium', label: 'Medium', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-200', color: '#92400E' },
    { value: 'high', label: 'High', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-200', color: '#DC2626' },
  ];

  const selectedOption = priorityOptions.find(option => option.value === selectedPriority) || priorityOptions[0];
  const isAll = selectedPriority === 'all';

  return (
    <Select value={selectedPriority} onValueChange={onPriorityChange}>
      <SelectTrigger className={`w-[140px] h-10 border ${
        isAll 
          ? 'bg-background text-foreground border-input' 
          : `${selectedOption.bgColor} ${selectedOption.textColor} ${selectedOption.borderColor}`
      }`}>
        <SelectValue>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedOption.color }}
            />
            <span className="text-sm font-medium truncate">
              {selectedOption.label}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-background border border-border z-50 min-w-[140px]">
        {priorityOptions.map((option) => (
          <SelectItem key={option.value} value={option.value} className="cursor-pointer hover:bg-accent/50">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: option.color }}
              />
              <span className="text-sm">{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
