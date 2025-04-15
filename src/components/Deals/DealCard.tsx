
import React from 'react';
import { Building, DollarSign, MoreVertical, Edit, Trash2, User, Repeat, CircleDot, Globe, Megaphone } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useDraggable } from '@dnd-kit/core';
import { Deal, Company, Stage, Profile } from './types/deal';
import { formatCurrency } from './utils/formatters';

interface DealCardProps {
  deal: Deal;
  companies: Company[];
  stages: Stage[];
  profiles: Profile[];
  canModify: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onMove: (deal: Deal) => void;
  onClick: (deal: Deal) => void;
}

export const DealCard = ({
  deal,
  companies,
  stages,
  profiles,
  canModify,
  onEdit,
  onDelete,
  onMove,
  onClick,
}: DealCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    disabled: !canModify
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  } : undefined;

  const company = companies.find(c => c.id === deal.company_id);
  const assignedTo = profiles.find(p => p.id === deal.assigned_to);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click when using dropdown or dragging
    if (e.target instanceof Element && (
      e.target.closest('button') || 
      isDragging
    )) {
      return;
    }
    onClick(deal);
  };

  return (
    <Card
      className="bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      onClick={handleClick}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-start">
          <h3 className="text-base font-semibold">{deal.title}</h3>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {/* Deal Type Icon */}
              {deal.deal_type === 'recurring' ? (
                <Repeat className="h-4 w-4 text-blue-600" aria-label="Recurring Deal" />
              ) : (
                <CircleDot className="h-4 w-4 text-gray-600" aria-label="One-time Deal" />
              )}
              {/* Client Deal Type Icon */}
              {deal.client_deal_type === 'web' ? (
                <Globe className="h-4 w-4 text-purple-600" aria-label="Web Project" />
              ) : deal.client_deal_type === 'marketing' ? (
                <Megaphone className="h-4 w-4 text-green-600" aria-label="Marketing Project" />
              ) : null}
            </div>
            {canModify && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(deal)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(deal.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-3 space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <Building className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{company?.name || 'No Company'}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{formatCurrency(deal.value || 0)}</span>
        </div>
        {assignedTo && (
          <div className="flex items-center text-gray-600">
            <User className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{`${assignedTo.first_name || ''} ${assignedTo.last_name || ''}`}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
