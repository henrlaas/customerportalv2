import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  DollarSign,
  Building,
  MoreHorizontal,
  ArrowRightCircle,
  Archive,
  Repeat,
  Copy,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Campaign } from './types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/components/Deals/utils/formatters';
import { fetchFavicon } from '@/services/companyHelpers';
import { PlatformBadge } from './PlatformBadge';
import { EditCampaignDialog } from './EditCampaignDialog/EditCampaignDialog';
import { DeleteCampaignDialog } from './DeleteCampaignDialog/DeleteCampaignDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useRealtimeAds } from '@/hooks/realtime/useRealtimeAds';
import { useRealtimeAdsets } from '@/hooks/realtime/useRealtimeAdsets';

interface CampaignCardEnhancedProps {
  campaign: Campaign;
}

export const CampaignCardEnhanced: React.FC<CampaignCardEnhancedProps> = ({ campaign }) => {
  const [expanded, setExpanded] = useState(false);
  const [companyFavicon, setCompanyFavicon] = useState<string | null>(null);

  // Enable real-time updates for this specific campaign's ads and adsets
  useRealtimeAds({ campaignId: campaign.id });
  useRealtimeAdsets({ campaignId: campaign.id });

  // Fetch favicon for the company
  React.useEffect(() => {
    if (campaign.companies?.name) {
      const getCompanyInfo = async () => {
        // First try to get the company details to find the website
        const { data: companyData } = await supabase
          .from('companies')
          .select('website')
          .eq('id', campaign.company_id)
          .single();
        
        if (companyData?.website) {
          const favicon = await fetchFavicon(companyData.website);
          setCompanyFavicon(favicon);
        }
      };
      
      getCompanyInfo();
    }
  }, [campaign.company_id, campaign.companies?.name]);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Modify the status badge color function to use more readable status labels
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-yellow-100 text-yellow-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to convert status to a more readable format
  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'Draft';
      case 'in-progress':
        return 'In Progress';
      case 'ready':
        return 'Ready';
      case 'published':
        return 'Published';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  // Fetch adsets and their ads for this campaign to calculate approval stats
  const { data: adsets = [] } = useQuery({
    queryKey: ['adsets', campaign.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('adsets')
        .select(`
          id,
          name,
          targeting,
          created_at,
          updated_at,
          ads (id, name, file_url, file_type, approval_status)
        `)
        .eq('campaign_id', campaign.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching adsets:', error);
        return [];
      }
      
      return data || [];
    },
    staleTime: 0, // Always fetch fresh data for real-time updates
  });

  // Calculate approval status for all ads in the campaign
  const getApprovalStatusBadge = () => {
    const allAds = adsets.flatMap((adset: any) => adset.ads || []);
    
    if (allAds.length === 0) {
      return null;
    }

    const approvedCount = allAds.filter((ad: any) => ad.approval_status === 'approved').length;
    const rejectedCount = allAds.filter((ad: any) => ad.approval_status === 'rejected').length;
    const draftCount = allAds.filter((ad: any) => !ad.approval_status || ad.approval_status === 'draft').length;

    // If all are draft, show "Under Review"
    if (draftCount === allAds.length) {
      return {
        label: 'Under Review',
        color: 'bg-gray-100 text-gray-800'
      };
    }

    // If there are both approved and rejected ads
    if (approvedCount > 0 && rejectedCount > 0) {
      return {
        label: `${approvedCount} approved, ${rejectedCount} rejected`,
        color: 'bg-yellow-100 text-yellow-800'
      };
    }

    // If only approved ads
    if (approvedCount > 0) {
      return {
        label: `${approvedCount} approved`,
        color: 'bg-green-100 text-green-800'
      };
    }

    // If only rejected ads
    if (rejectedCount > 0) {
      return {
        label: `${rejectedCount} rejected`,
        color: 'bg-red-100 text-red-800'
      };
    }

    // Default case (shouldn't happen)
    return {
      label: 'Under Review',
      color: 'bg-gray-100 text-gray-800'
    };
  };

  const approvalStatusBadge = getApprovalStatusBadge();

  // Helper function to check if profiles is valid and not an error
  const isValidProfile = (profile: any): profile is { first_name: string | null, last_name: string | null, avatar_url: string | null } => {
    return profile && !('error' in profile);
  };

  const userInitials = isValidProfile(campaign.profiles) ? 
    `${campaign.profiles.first_name?.[0] || ''}${campaign.profiles.last_name?.[0] || ''}` : 
    'U';

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const duplicateMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase
        .rpc('duplicate_campaign', {
          campaign_id_param: campaignId
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Campaign duplicated",
        description: "The campaign and its assets have been duplicated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (error) => {
      toast({
        title: "Error duplicating campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fix the event type to match what DropdownMenuItem expects
  const handleDuplicate = () => {
    duplicateMutation.mutate(campaign.id);
  };

  // Handle clicks that should prevent navigation
  const handleInteractiveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link to={`/campaigns/${campaign.id}`} className="block">
      <Card className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer",
        expanded && "ring-1 ring-primary/10"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center overflow-hidden">
                {companyFavicon ? (
                  <img
                    src={companyFavicon}
                    alt={`${campaign.companies?.name || 'Company'} favicon`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null; 
                      e.currentTarget.src = ''; 
                      e.currentTarget.className = 'hidden';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const icon = document.createElement('div');
                        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><circle cx="12" cy="12" r="4"></circle></svg>';
                        icon.className = 'flex items-center justify-center w-full h-full text-gray-400';
                        parent.appendChild(icon);
                      }
                    }}
                  />
                ) : (
                  <Building className="h-4 w-4 text-gray-400" />
                )}
              </div>

              <div>
                <CardTitle className="text-lg hover:underline transition-colors">
                  {campaign.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {campaign.companies?.name || 'No company'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2" onClick={handleInteractiveClick}>
              {approvalStatusBadge && (
                <Badge variant="outline" className={`text-xs ${approvalStatusBadge.color}`}>
                  {approvalStatusBadge.label}
                </Badge>
              )}
              
              <Badge className={getStatusBadgeColor(campaign.status)}>
                {formatStatus(campaign.status)}
              </Badge>
              
              {campaign.platform && (
                <PlatformBadge 
                  platform={campaign.platform} 
                  className="w-8 h-8 !p-0 flex items-center justify-center"
                  showLabel={false}
                />
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <EditCampaignDialog campaign={campaign} trigger={
                      <Button variant="ghost" className="w-full justify-start h-9 px-2 py-1.5 text-sm">
                        <Edit className="mr-2 h-3.5 w-3.5" />
                        <span>Edit Campaign</span>
                      </Button>
                    } />
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-9 px-2 py-1.5 text-sm"
                      onClick={handleDuplicate}
                    >
                      <Copy className="mr-2 h-3.5 w-3.5" />
                      <span>Duplicate Campaign</span>
                    </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
                    <DeleteCampaignDialog campaign={campaign} trigger={
                      <Button variant="ghost" className="w-full justify-start text-destructive h-9 px-2 py-1.5 text-sm">
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        <span>Delete Campaign</span>
                      </Button>
                    } />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-2 text-sm">
              {campaign.is_ongoing ? (
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-gray-500" />
                  <span>Ongoing</span>
                </div>
              ) : (
                <>
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}</span>
                </>
              )}
            </div>
            
            {campaign.budget && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span>{formatCurrency(campaign.budget)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={isValidProfile(campaign.profiles) ? campaign.profiles.avatar_url || undefined : undefined} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <span className="text-sm">
                {isValidProfile(campaign.profiles) ? 
                  `${campaign.profiles.first_name || ''} ${campaign.profiles.last_name || ''}`.trim() || 'Unnamed' : 
                  'Unassigned'}
              </span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                handleInteractiveClick(e);
                setExpanded(!expanded);
              }}
              className="h-8 px-2"
            >
              {adsets.length > 0 ? (
                <>
                  <span className="mr-1">Ad Sets ({adsets.length})</span>
                  {expanded ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </>
              ) : (
                <span className="text-sm text-muted-foreground">No Ad Sets</span>
              )}
            </Button>
          </div>

          {expanded && adsets.length > 0 && (
            <div className={cn(
              "mt-4 space-y-3 overflow-hidden transition-all duration-300",
              expanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            )}>
              {adsets.map((adset: any) => (
                <div key={adset.id} className="border rounded-md p-3">
                  <div className="flex justify-between mb-2">
                    <Link 
                      to={`/adsets/${adset.id}`} 
                      className="font-medium hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {adset.name}
                    </Link>
                  </div>
                  
                  {adset.targeting && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {adset.targeting}
                    </p>
                  )}
                  
                  {adset.ads && adset.ads.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {adset.ads.map((ad: any) => (
                        <Link
                          to={`/ads/${ad.id}`}
                          key={ad.id}
                          className="p-2 bg-muted hover:bg-muted/70 rounded-md text-xs flex items-center gap-1 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ad.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
