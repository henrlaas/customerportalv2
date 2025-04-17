import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  DollarSign,
  Building,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Campaign, PLATFORM_COLORS } from './types/campaign';
import { PlatformIcon } from './PlatformIcon';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/components/Deals/utils/formatters';

interface CampaignCardEnhancedProps {
  campaign: Campaign;
}

export const CampaignCardEnhanced: React.FC<CampaignCardEnhancedProps> = ({ campaign }) => {
  const [expanded, setExpanded] = useState(false);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
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

  // Fetch adsets for this campaign
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
          ads (id, name, file_url, file_type)
        `)
        .eq('campaign_id', campaign.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching adsets:', error);
        return [];
      }
      
      return data || [];
    },
  });

  const userInitials = campaign.profiles ? 
    `${campaign.profiles.first_name?.[0] || ''}${campaign.profiles.last_name?.[0] || ''}` : 
    'U';

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200",
      expanded && "ring-1 ring-primary/10"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2" style={{ 
              backgroundColor: campaign.platform ? PLATFORM_COLORS[campaign.platform as keyof typeof PLATFORM_COLORS]?.bg : '#f4f4f5'
            }}>
              <PlatformIcon platform={campaign.platform} size={18} />
            </div>

            <div>
              <CardTitle className="text-lg">
                <Link to={`/campaigns/${campaign.id}`} className="hover:underline transition-colors">
                  {campaign.name}
                </Link>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {campaign.companies?.name || 'No company'}
              </p>
            </div>
          </div>

          <Badge className={getStatusBadgeColor(campaign.status)}>
            {campaign.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>
              {campaign.is_ongoing ? 
                'Ongoing Campaign' : 
                `${formatDate(campaign.start_date)} - ${formatDate(campaign.end_date)}`}
            </span>
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
              <AvatarImage src={campaign.profiles?.avatar_url || undefined} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {campaign.profiles ? 
                `${campaign.profiles.first_name || ''} ${campaign.profiles.last_name || ''}`.trim() : 
                'Unassigned'}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
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
  );
};
