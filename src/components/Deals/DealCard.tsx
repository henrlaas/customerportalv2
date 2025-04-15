import React from 'react';
import { format } from 'date-fns';
import { Building, Calendar, DollarSign, MoreVertical, ChevronRight, Edit, Trash2, User, Repeat } from 'lucide-react';
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

// Import types from DealsPage to ensure consistency
import { Company, Stage, Profile, Deal } from '@/pages/DealsPage';

interface DealCardProps {
  deal: Deal;
  companies: Company[];
  stages: Stage[];
  profiles: Profile[];
  canModify: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onMove: (deal: Deal) => void;
}

export const DealCard = ({ 
  deal, 
  companies, 
  stages, 
  profiles,
  canModify, 
  onEdit, 
  onDelete,
  onMove
}: DealCardProps) => {
  // Set up draggable functionality
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    disabled: !canModify
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  } : undefined;
  
  // Get company name
  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return 'No company';
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };
  
  // Get user name
  const getAssigneeName = (userId: string | null) => {
    if (!userId) return 'Unassigned';
    const profile = profiles.find(p => p.id === userId);
    if (!profile) return 'Unknown User';
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
  };
  
  // Updated currency formatting to use kr
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      currencyDisplay: 'symbol'
    }).format(value).replace('NOK', 'kr');
  };
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  return (
    <Card 
      className="bg-white shadow-sm cursor-move"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-start">
          <h3 className="text-base font-semibold">{deal.title}</h3>
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
      </CardHeader>
      <CardContent className="px-4 py-3 space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <Building className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{getCompanyName(deal.company_id)}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{formatDate(deal.expected_close_date)}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{formatCurrency(deal.value)}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <User className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{getAssigneeName(deal.assigned_to)}</span>
        </div>
        {deal.is_recurring && (
          <div className="mt-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Repeat className="h-3 w-3" />
              <span>Recurring</span>
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
