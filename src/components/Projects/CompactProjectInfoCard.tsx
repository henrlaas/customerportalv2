
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Building, DollarSign, Calendar, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { CompanyFavicon } from '@/components/CompanyFavicon';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { useAuth } from '@/contexts/AuthContext';

interface CompactProjectInfoCardProps {
  project: any;
  assignees?: any[];
  financialData?: {
    totalCost: number;
    totalHours: number;
  };
  isLoadingFinancial?: boolean;
}

export const CompactProjectInfoCard: React.FC<CompactProjectInfoCardProps> = ({
  project,
  assignees = [],
  financialData,
  isLoadingFinancial = false
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { isAdmin } = useAuth();

  // Format currency for display
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Not specified';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Format price type for display
  const formatPriceType = (priceType: string | null) => {
    if (!priceType) return 'Not specified';
    
    return priceType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate project profit/loss
  const calculateProjectProfit = () => {
    const projectValue = project?.value || 0;
    const totalCost = financialData?.totalCost || 0;
    const profit = projectValue - totalCost;
    const profitPercentage = projectValue ? (profit / projectValue) * 100 : 0;
    
    return {
      profit,
      profitPercentage
    };
  };

  // Get deadline status badge
  const getDeadlineBadge = () => {
    if (!project?.deadline) return null;
    
    const deadline = new Date(project.deadline);
    const now = new Date();
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
      return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
    } else if (daysUntil <= 7) {
      return <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">Due Soon</Badge>;
    } else if (daysUntil <= 30) {
      return <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">Upcoming</Badge>;
    }
    return null;
  };

  const deadlineBadge = getDeadlineBadge();
  const hasLongDescription = project?.description && project.description.length > 150;

  return (
    <Card className="bg-gradient-to-br from-background to-muted/20 border-primary/10">
      <CardContent className="p-6">
        {/* Header with title and badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-foreground">{project?.name}</h2>
            {deadlineBadge}
          </div>
        </div>

        {/* Main info grid - 3 columns on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Company */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60">
            <Building className="h-4 w-4 text-blue-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Company</p>
              <div className="flex items-center gap-2">
                {project?.company && (
                  <CompanyFavicon 
                    companyName={project.company.name} 
                    website={project.company.website}
                    size="sm"
                  />
                )}
                <span className="font-medium text-sm truncate">{project?.company?.name || 'Not assigned'}</span>
              </div>
            </div>
          </div>

          {/* Value */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60">
            <DollarSign className="h-4 w-4 text-green-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Value</p>
              <p className="font-medium text-sm truncate">
                {project?.value ? `${project.value.toLocaleString()} NOK` : 'Not specified'}
              </p>
            </div>
          </div>

          {/* Deadline */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60">
            <Calendar className="h-4 w-4 text-orange-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Deadline</p>
              <p className="font-medium text-sm truncate">{formatDate(project?.deadline)}</p>
            </div>
          </div>
        </div>

        {/* Secondary info row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Price Type */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60">
            <div className="h-4 w-4 bg-purple-600 rounded shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Price Type</p>
              <p className="font-medium text-sm truncate">{formatPriceType(project?.price_type)}</p>
            </div>
          </div>

          {/* Team Members */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60">
            <Users className="h-4 w-4 text-indigo-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium">Team Members</p>
              {assignees && assignees.length > 0 ? (
                <div className="flex items-center gap-2">
                  <UserAvatarGroup
                    users={assignees.map(assignee => ({
                      id: assignee.user_id,
                      first_name: assignee.profiles?.first_name,
                      last_name: assignee.profiles?.last_name,
                      avatar_url: assignee.profiles?.avatar_url
                    }))}
                    size="sm"
                    maxVisible={3}
                  />
                  <span className="text-xs text-muted-foreground">
                    {assignees.length} {assignees.length === 1 ? 'member' : 'members'}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No members assigned</p>
              )}
            </div>
          </div>
        </div>

        {/* Finance Section for Admins */}
        {isAdmin && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Financial Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-background/60 border">
                  <p className="text-xs text-muted-foreground font-medium">Project Value</p>
                  <p className="text-sm font-semibold">{formatCurrency(project?.value)}</p>
                </div>
                <div className="p-3 rounded-lg bg-background/60 border">
                  <p className="text-xs text-muted-foreground font-medium">Cost to Date</p>
                  <p className="text-sm font-semibold">
                    {isLoadingFinancial ? 'Loading...' : formatCurrency(financialData?.totalCost || 0)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/60 border">
                  <p className="text-xs text-muted-foreground font-medium">Projected Profit</p>
                  {isLoadingFinancial ? (
                    <p className="text-sm">Loading...</p>
                  ) : (
                    <p className={`text-sm font-semibold ${calculateProjectProfit().profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(calculateProjectProfit().profit)} 
                      <span className="text-xs ml-1">
                        ({calculateProjectProfit().profitPercentage.toFixed(0)}%)
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Collapsible Description */}
        {project?.description && (
          <>
            <Separator className="my-4" />
            <Collapsible open={isDescriptionExpanded} onOpenChange={setIsDescriptionExpanded}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Description</h3>
                  {hasLongDescription && (
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-1">
                        {isDescriptionExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  )}
                </div>
                
                {hasLongDescription ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {isDescriptionExpanded 
                        ? project.description 
                        : `${project.description.substring(0, 150)}...`
                      }
                    </p>
                    <CollapsibleContent>
                      {/* Content is handled above */}
                    </CollapsibleContent>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                )}
              </div>
            </Collapsible>
          </>
        )}
      </CardContent>
    </Card>
  );
};
