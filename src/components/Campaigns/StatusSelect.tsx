
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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

  const getStatusColors = (status: string) => {
    if (status === 'all') {
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200'
      };
    }
    return CAMPAIGN_STATUS_COLORS[status as CampaignStatus] || CAMPAIGN_STATUS_COLORS.draft;
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
      <SelectTrigger className="min-w-[160px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            <Badge 
              className={`${getStatusColors(selectedStatus).bg} ${getStatusColors(selectedStatus).text} ${getStatusColors(selectedStatus).border} text-xs`}
              variant="outline"
            >
              {formatStatusLabel(selectedStatus)}
            </Badge>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-background border border-border z-50">
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <Badge 
                className={`${getStatusColors(option.value).bg} ${getStatusColors(option.value).text} ${getStatusColors(option.value).border} text-xs`}
                variant="outline"
              >
                {option.label}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
