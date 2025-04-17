
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  DollarSign,
  Building,
  User,
  ImageIcon
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
import { fetchFavicon } from '@/services/companyHelpers';

interface CampaignCardEnhancedProps {
  campaign: Campaign;
}

export const CampaignCardEnhanced: React.FC<CampaignCardEnhancedProps> = ({ campaign }) => {
  const [expanded, setExpanded] = useState(false);
  const [companyFavicon, setCompanyFavicon] = useState<string | null>(null);

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

  // Helper function to check if profiles is valid and not an error
  const isValidProfile = (profile: any): profile is { first_name: string | null, last_name: string | null, avatar_url: string | null } => {
    return profile && !('error' in profile);
  };

  const userInitials = isValidProfile(campaign.profiles) ? 
    `${campaign.profiles.first_name?.[0] || ''}${campaign.profiles.last_name?.[0] || ''}` : 
    'U';

  const platformStyle = campaign.platform ? {
    backgroundColor: PLATFORM_COLORS[campaign.platform as keyof typeof PLATFORM_COLORS]?.bg
  } : {};

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200",
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

          <div className="flex items-center gap-2">
            {campaign.platform && (
              <div 
                className="rounded-full w-8 h-8 flex items-center justify-center" 
                style={platformStyle}
              >
                <i 
                  className={`fa-brands fa-${campaign.platform.toLowerCase().replace('linkedin', 'linkedin-in')} ${PLATFORM_COLORS[campaign.platform as keyof typeof PLATFORM_COLORS]?.text}`}
                  style={{ 
                    fontSize: '18px', 
                    color: campaign.platform === 'Google' ? '#34A853' : undefined 
                  }}
                ></i>
              </div>
            )}

            <Badge className={getStatusBadgeColor(campaign.status)}>
              {campaign.status}
            </Badge>
          </div>
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
