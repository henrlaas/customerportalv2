import React, { useState } from 'react';
import { Building, Calendar, DollarSign, MoreVertical, Edit, Trash2, User, Repeat, CircleDollarSign, Globe, Megaphone } from 'lucide-react';
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

// Import types from the deal types file
import { Deal, Company, Stage, Profile, TempDealCompany } from '@/components/Deals/types/deal';

// Import formatters
import { formatCurrency, formatDate, getCompanyName, getAssigneeName } from './utils/formatters';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DealDetailsDialog } from './DealDetailsDialog';

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
  const [showDetails, setShowDetails] = useState(false);
  
  // Fetch temp company info if needed
  const { data: tempCompanies } = useQuery({
    queryKey: ['temp-deal-companies', deal.id],
    queryFn: async () => {
      // Only fetch if this deal doesn't have a company_id
      if (deal.company_id) return null;
      
      const { data } = await supabase
        .from('temp_deal_companies')
        .select('deal_id, company_name')
        .eq('deal_id', deal.id);
        
      return data || null;
    },
    // Only run this query for deals without company_id
    enabled: !deal.company_id
  });
  
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
  
  return (
    <>
      <Card 
        className="bg-white shadow-sm cursor-pointer"
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        onClick={(e) => {
          // Prevent opening details when clicking on dropdown menu
          if (!(e.target as HTMLElement).closest('.dropdown-trigger')) {
            setShowDetails(true);
          }
        }}
      >
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex justify-between items-start">
            <h3 className="text-base font-semibold">{deal.title}</h3>
            <div className="flex items-center gap-2">
              {/* Deal Type Icon */}
              {deal.deal_type === 'recurring' ? (
                <Repeat className="h-4 w-4 text-blue-500" aria-label="Recurring deal" />
              ) : (
                <CircleDollarSign className="h-4 w-4 text-green-500" aria-label="One-time deal" />
              )}
              {/* Client Deal Type Icon */}
              {deal.client_deal_type === 'web' ? (
                <Globe className="h-4 w-4 text-purple-500" aria-label="Web deal" />
              ) : (
                <Megaphone className="h-4 w-4 text-orange-500" aria-label="Marketing deal" />
              )}
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
            <span className="truncate">{getCompanyName(deal.company_id, companies, tempCompanies, deal.id)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{formatCurrency(deal.value)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <User className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{getAssigneeName(deal.assigned_to, profiles)}</span>
          </div>
        </CardContent>
      </Card>

      <DealDetailsDialog
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        deal={deal}
        companies={companies}
        profiles={profiles}
        tempCompanies={tempCompanies}
      />
    </>
  );
};
