
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Facebook, Instagram, Linkedin, Twitter, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Campaign } from './CampaignCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface EnhancedCampaignCardProps {
  campaign: Campaign;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  const iconProps = { className: "h-5 w-5", strokeWidth: 1.5 };
  switch (platform?.toLowerCase()) {
    case 'facebook':
      return <Facebook {...iconProps} className="text-blue-600" />;
    case 'instagram':
      return <Instagram {...iconProps} className="text-pink-600" />;
    case 'linkedin':
      return <Linkedin {...iconProps} className="text-blue-700" />;
    case 'twitter':
      return <Twitter {...iconProps} className="text-blue-400" />;
    default:
      return <MessageSquare {...iconProps} className="text-gray-400" />;
  }
};

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
          ads (*)
        `)
        .eq('campaign_id', campaign.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd.MM.yyyy');
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <PlatformIcon platform={campaign.platform || ''} />
            <div>
              <Link to={`/campaigns/${campaign.id}`} className="hover:underline">
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
              </Link>
              <div className="text-sm text-muted-foreground">
                {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(campaign.status)}>
            {campaign.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-sm">
            Budget: ${campaign.budget?.toLocaleString() || '0'}
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
