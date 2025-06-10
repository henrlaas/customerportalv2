
import React, { useState } from 'react';
import { Building, Calendar, DollarSign, MoreVertical, Edit, Trash2, User, Repeat, CircleDollarSign, Globe, Megaphone } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useDraggable } from '@dnd-kit/core';
import { CompanyFavicon } from '@/components/CompanyFavicon';

// Import types from the deal types file and main company types
import { Deal, Stage, Profile, TempDealCompany } from '@/components/Deals/types/deal';
import { Company } from '@/types/company';

// Import formatters
import { formatCurrency, formatDate, getCompanyName, getAssigneeName } from './utils/formatters';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DealDetailsSidebar } from './DealDetailsSidebar';

interface EnhancedDealCardProps {
  deal: Deal;
  companies: Company[];
  stages: Stage[];
  profiles: Profile[];
  canModify: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onMove: (deal: Deal) => void;
}

export const EnhancedDealCard = ({ 
  deal, 
  companies, 
  stages, 
  profiles,
  canModify, 
  onEdit, 
  onDelete,
  onMove
}: EnhancedDealCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Fetch temp company info if needed
  const { data: tempCompanies } = useQuery({
    queryKey: ['temp-deal-companies', deal.id],
    queryFn: async () => {
      // Only fetch if this deal doesn't have a company_id
      if (deal.company_id) return null;
      
      const { data } = await supabase
        .from('temp_deal_companies')
        .select('deal_id, company_name, website')
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
  
  // Handle card click without opening details when clicking on dropdown
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't open details if clicking inside the dropdown menu
    if (!(e.target as HTMLElement).closest('.dropdown-trigger')) {
      setShowDetails(true);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(deal.id);
    setShowDeleteDialog(false);
  };

  // Get company info
  const company = companies.find(c => c.id === deal.company_id);
  const companyName = getCompanyName(deal.company_id, companies, tempCompanies, deal.id);
  const tempCompany = tempCompanies?.[0];
  
  // Get assigned user info
  const assignedUser = profiles.find(p => p.id === deal.assigned_to);
  const getUserInitials = (user: Profile | undefined) => {
    if (!user) return '?';
    const first = user.first_name?.charAt(0) || '';
    const last = user.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  // Deal type badge configuration
  const getDealTypeBadge = () => {
    if (deal.deal_type === 'recurring') {
      return (
        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
          <Repeat className="w-3 h-3 mr-1" />
          Recurring
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs bg-green-50 text-green-600 border-green-200">
        <CircleDollarSign className="w-3 h-3 mr-1" />
        One-time
      </Badge>
    );
  };

  const getClientTypeBadge = () => {
    if (deal.client_deal_type === 'web') {
      return (
        <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
          <Globe className="w-3 h-3 mr-1" />
          Web
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
        <Megaphone className="w-3 h-3 mr-1" />
        Marketing
      </Badge>
    );
  };
  
  return (
    <>
      <Card 
        className="bg-white hover:bg-gray-50/80 cursor-pointer transition-all duration-200 hover:shadow-md border border-gray-200"
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3 pt-4 px-4">
          {/* Header with company logo, title, and actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                <CompanyFavicon
                  companyName={companyName}
                  website={company?.website || tempCompany?.website}
                  logoUrl={company?.logo_url}
                  size="md"
                />
              </div>
              
              {/* Title and Company */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-tight text-gray-900 truncate">
                  {deal.title}
                </h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {companyName}
                </p>
              </div>
            </div>

            {/* Actions dropdown */}
            {canModify && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 dropdown-trigger flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-0">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEdit(deal);
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600" 
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-4 py-3 pt-0 space-y-3">
          {/* Deal Value - Prominent Display */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Deal Value</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(deal.value)}
              </span>
            </div>
          </div>

          {/* Deal Type Badges */}
          <div className="flex flex-wrap gap-1.5">
            {getDealTypeBadge()}
            {getClientTypeBadge()}
          </div>

          {/* Deal Holder */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Deal holder</span>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={assignedUser?.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                  {getUserInitials(assignedUser)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-700 truncate max-w-20">
                {assignedUser ? `${assignedUser.first_name || ''} ${assignedUser.last_name || ''}`.trim() || 'Unknown' : 'Unassigned'}
              </span>
            </div>
          </div>

          {/* Progress Bar (if probability exists) */}
          {deal.probability !== null && deal.probability !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-600">Probability</span>
                <span className="text-xs text-gray-700">{deal.probability}%</span>
              </div>
              <Progress value={deal.probability} className="h-2" />
            </div>
          )}

          {/* Due Date (if exists) */}
          {deal.expected_close_date && (
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-600">Expected Close</span>
              <span className="text-gray-700">{formatDate(deal.expected_close_date)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <DealDetailsSidebar
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        deal={deal}
        companies={companies}
        profiles={profiles}
        stages={stages}
        canModify={canModify}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the deal "{deal.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
