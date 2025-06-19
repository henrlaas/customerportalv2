
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Repeat, CircleDollarSign, Megaphone, Globe } from 'lucide-react';

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
        <SelectContent align="start">
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="recurring">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                <Repeat className="w-3 h-3 text-blue-600" />
              </div>
              <span>Recurring</span>
            </div>
          </SelectItem>
          <SelectItem value="one-time">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                <CircleDollarSign className="w-3 h-3 text-green-600" />
              </div>
              <span>One-Time</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Select value={clientTypeFilter} onValueChange={onClientTypeFilterChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Client Type" />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value="all">All Clients</SelectItem>
          <SelectItem value="marketing">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                <Megaphone className="w-3 h-3 text-orange-600" />
              </div>
              <span>Marketing</span>
            </div>
          </SelectItem>
          <SelectItem value="web">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
                <Globe className="w-3 h-3 text-purple-600" />
              </div>
              <span>Web</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
