
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, Building, DollarSign, User } from 'lucide-react';
import { Deal, Company, Profile } from './types/deal';
import { formatCurrency } from './utils/formatters';

interface DealDetailsDialogProps {
  deal: Deal | null;
  companies: Company[];
  profiles: Profile[];
  isOpen: boolean;
  onClose: () => void;
}

export const DealDetailsDialog = ({
  deal,
  companies,
  profiles,
  isOpen,
  onClose,
}: DealDetailsDialogProps) => {
  if (!deal) return null;

  const company = companies.find(c => c.id === deal.company_id);
  const assignedTo = profiles.find(p => p.id === deal.assigned_to);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{deal.title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-4 p-2">
            <div className="space-y-2">
              {deal.description && (
                <p className="text-sm text-gray-600">{deal.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="h-4 w-4" />
                <span>{company?.name || 'No Company'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>{formatCurrency(deal.value || 0)}</span>
              </div>
              {deal.assigned_to && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>
                    {assignedTo ? `${assignedTo.first_name} ${assignedTo.last_name}` : 'Unknown'}
                  </span>
                </div>
              )}
              {deal.expected_close_date && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarDays className="h-4 w-4" />
                  <span>{new Date(deal.expected_close_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
