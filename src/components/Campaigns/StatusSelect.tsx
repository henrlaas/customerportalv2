
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CAMPAIGN_STATUS_COLORS, CampaignStatus } from './types/campaign';

interface StatusSelectProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export const StatusSelect: React.FC<StatusSelectProps> = ({
  selectedStatus,
  onStatusChange,
}) => {
  const statusOptions: { value: string; label: string; isAll?: boolean }[] = [
    { value: 'all', label: 'All', isAll: true },
    { value: 'draft', label: 'Draft' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'ready', label: 'Ready' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'all') {
      return '#6B7280'; // gray-500
    }
    const colors = CAMPAIGN_STATUS_COLORS[status as CampaignStatus];
    if (!colors) return '#6B7280';
    
    // Convert Tailwind classes to actual colors
    const colorMap: { [key: string]: string } = {
      'bg-gray-100': '#F3F4F6',
      'bg-blue-100': '#DBEAFE',
      'bg-yellow-100': '#FEF3C7',
      'bg-green-100': '#DCFCE7',
      'bg-slate-100': '#F1F5F9',
      'text-gray-800': '#1F2937',
      'text-blue-800': '#1E40AF',
      'text-yellow-800': '#92400E',
      'text-green-800': '#166534',
      'text-slate-800': '#1E293B',
    };
    
    return colorMap[colors.text] || '#6B7280';
  };

  const formatStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'Draft';
      case 'in-progress': return 'In Progress';
      case 'ready': return 'Ready';
      case 'published': return 'Published';
      case 'archived': return 'Archived';
      default: return 'All';
    }
  };

  return (
    <Select value={selectedStatus} onValueChange={onStatusChange}>
      <SelectTrigger className="w-[140px] h-10">
        <SelectValue>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getStatusColor(selectedStatus) }}
            />
            <span className="text-sm font-medium truncate">
              {formatStatusLabel(selectedStatus)}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-background border border-border z-50 min-w-[140px]">
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: getStatusColor(option.value) }}
              />
              <span className="text-sm">{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
