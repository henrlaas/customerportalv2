
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DealTypeFiltersProps {
  recurringFilter: string;
  onRecurringFilterChange: (value: string) => void;
  clientTypeFilter: string;
  onClientTypeFilterChange: (value: string) => void;
}

export const DealTypeFilters: React.FC<DealTypeFiltersProps> = ({
  recurringFilter,
  onRecurringFilterChange,
  clientTypeFilter,
  onClientTypeFilterChange,
}) => {
  return (
    <div className="flex items-center gap-3">
      <Select value={recurringFilter} onValueChange={onRecurringFilterChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Deal Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="recurring">Recurring</SelectItem>
          <SelectItem value="one-time">One-Time</SelectItem>
        </SelectContent>
      </Select>

      <Select value={clientTypeFilter} onValueChange={onClientTypeFilterChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Client Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Clients</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="web">Web</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
