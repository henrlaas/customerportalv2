
import React from 'react';
import { format } from 'date-fns';
import { Building, Calendar, DollarSign, MoreVertical, ChevronRight, Edit, Trash2, User } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export type Company = {
  id: string;
  name: string;
};

export type Stage = {
  id: string;
  name: string;
  position: number;
};

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

export type Deal = {
  id: string;
  title: string;
  description: string | null;
  company_id: string | null;
  stage_id: string | null;
  expected_close_date: string | null;
  value: number | null;
  probability: number | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

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
  
  // Format currency
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  return (
    <Card className="bg-white shadow-sm">
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
                <DropdownMenuItem onClick={() => onMove(deal)}>
                  <ChevronRight className="mr-2 h-4 w-4" />
                  Move
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
        <div className="flex justify-between items-center pt-1">
          <Badge variant={deal.probability && deal.probability > 70 ? "default" : "outline"}>
            {deal.probability || 0}% Probability
          </Badge>
          {deal.probability && deal.probability > 0 && (
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary"
                style={{ width: `${deal.probability}%` }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
