
import React, { forwardRef } from 'react';
import {
  Calendar,
  Building,
  DollarSign,
  Tag,
  MoreVertical,
  Trash2,
  Edit,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Repeat
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Deal, Company, Stage, Profile } from '@/components/Deals/types/deal';
import { formatCurrency } from './utils/formatters';

interface DealCardProps {
  deal: Deal;
  companies: Company[];
  stages: Stage[];
  profiles: Profile[];
  canModify: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onMove: (deal: Deal) => void;  // Updated to accept a Deal parameter
}

const DealCard = forwardRef(({ 
  deal,
  companies,
  stages,
  profiles,
  canModify,
  onEdit,
  onDelete,
  onMove 
}: DealCardProps, ref: any) => {
  // Format currency
  const formatCurrencyValue = (value: number | null) => {
    if (value === null) return 'N/A';
    return formatCurrency(value);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Get company name by ID
  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return 'No Company';
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };

  // Get stage name by ID
  const getStageName = (stageId: string | null) => {
    if (!stageId) return 'No Stage';
    const stage = stages.find(s => s.id === stageId);
    return stage ? stage.name : 'Unknown Stage';
  };

  // Get assigned to name by ID
  const getAssignedToName = (assignedTo: string | null) => {
    if (!assignedTo) return 'Unassigned';
    const profile = profiles.find(p => p.id === assignedTo);
    return profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.id : 'Unknown User';
  };
  
  return (
    <div
      ref={ref}
      data-id={deal.id}
      className="bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing"
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{deal.title}</h3>
          {canModify && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <MoreVertical className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(deal)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(deal.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          <Building className="mr-2 inline-block h-4 w-4" />
          {getCompanyName(deal.company_id)}
        </div>
        <div className="flex items-center mt-2">
          <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
          <span className="text-sm">{formatCurrencyValue(deal.value)}</span>
        </div>
        <div className="flex items-center mt-2">
          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
          <span className="text-sm">{formatDate(deal.expected_close_date)}</span>
        </div>
        <div className="flex items-center mt-2">
          <Tag className="mr-2 h-4 w-4 text-gray-500" />
          <span className="text-sm">{getAssignedToName(deal.assigned_to)}</span>
        </div>
      </div>
    </div>
  );
});

DealCard.displayName = 'DealCard';

export { DealCard };
