
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AdsList } from '@/components/Campaigns/Ads/AdsList';
import { CreateAdDialog } from '@/components/Campaigns/Ads/CreateAdDialog';

export function AdSetDetailsPage() {
  const { adsetId } = useParams<{ adsetId: string }>();

  const { data: adset } = useQuery({
    queryKey: ['adset', adsetId],
    queryFn: async () => {
      const { data } = await supabase
        .from('adsets')
        .select('*, campaigns(*)')
        .eq('id', adsetId)
        .single();
      return data;
    },
  });

  const { data: ads = [] } = useQuery({
    queryKey: ['ads', adsetId],
    queryFn: async () => {
      const { data } = await supabase
        .from('ads')
        .select('*')
        .eq('adset_id', adsetId)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const campaignPlatform = adset?.campaigns?.platform;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>Campaign: {adset?.campaigns?.name}</span>
            <span>•</span>
            <span>Platform: {campaignPlatform || 'Unknown'}</span>
          </div>
          <h1 className="text-2xl font-bold">{adset?.name || 'Ad Set Details'}</h1>
          {adset?.targeting && (
            <p className="text-muted-foreground mt-2">
              <span className="font-medium">Targeting:</span> {adset.targeting}
            </p>
          )}
        </div>
        {adsetId && <CreateAdDialog adsetId={adsetId} campaignPlatform={campaignPlatform} />}
      </div>
      <AdsList ads={ads} campaignPlatform={campaignPlatform} />
    </div>
  );
}
