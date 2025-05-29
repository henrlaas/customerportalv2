
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, MessageSquare, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Campaign } from './types/campaign';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/components/Deals/utils/formatters';
import { PlatformBadge } from './PlatformBadge';
import { EditCampaignDialog } from './EditCampaignDialog/EditCampaignDialog';
import { DeleteCampaignDialog } from './DeleteCampaignDialog/DeleteCampaignDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface EnhancedCampaignCardProps {
  campaign: Campaign;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const EnhancedCampaignCard = ({ campaign }: EnhancedCampaignCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: adsets = [] } = useQuery({
    queryKey: ['adsets', campaign.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('adsets')
        .select(`
          *,
          ads (*, approval_status)
        `)
        .eq('campaign_id', campaign.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd.MM.yyyy');
  };

  return (
    <Card className="overflow-hidden bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {campaign.platform ? (
              <div className="w-8 h-8 overflow-hidden flex items-center justify-center">
                <PlatformBadge 
                  platform={campaign.platform} 
                  className="w-8 h-8 !p-0 flex items-center justify-center"
                  showLabel={false}
                />
              </div>
            ) : (
              <MessageSquare className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
            )}
            <div>
              <Link to={`/campaigns/${campaign.id}`} className="hover:underline">
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
              </Link>
              <div className="text-sm text-muted-foreground">
                {campaign.is_ongoing ? 
                  'Ongoing Campaign' : 
                  `${formatDate(campaign.start_date)} - ${formatDate(campaign.end_date)}`
                }
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status}
            </Badge>
            
            {approvalStatusBadge && (
              <Badge variant="outline" className={`text-xs ${approvalStatusBadge.color}`}>
                {approvalStatusBadge.label}
              </Badge>
            )}

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
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl shadow-[rgba(145,158,171,0.2)_0px_0px_2px_0px,rgba(145,158,171,0.12)_0px_12px_24px_-4px] border-0">
                <DropdownMenuItem asChild>
                  <EditCampaignDialog campaign={campaign} trigger={<Button variant="ghost" className="w-full justify-start">Edit Campaign</Button>} />
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
                  <DeleteCampaignDialog campaign={campaign} trigger={<Button variant="ghost" className="w-full justify-start text-destructive">Delete Campaign</Button>} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-sm">
            Budget: {formatCurrency(campaign.budget)}
          </div>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full flex justify-between">
              <span>Ad Sets ({adsets.length})</span>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-2">
              {adsets.map((adset: any) => (
                <Card key={adset.id} className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link to={`/adsets/${adset.id}`} className="font-medium hover:underline">
                        {adset.name}
                      </Link>
                      {adset.targeting && (
                        <div className="text-sm text-muted-foreground">
                          Targeting: {adset.targeting}
                        </div>
                      )}
                    </div>
                  </div>
                  {adset.ads && adset.ads.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {adset.ads.map((ad: any) => (
                        <div key={ad.id} className="p-2 bg-muted rounded-md text-sm">
                          {ad.name}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
