
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateAdSetDialog } from '@/components/Campaigns/Adsets/CreateAdSetDialog';
import { AdSetList } from '@/components/Campaigns/Adsets/AdSetList';

export function CampaignDetailsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();

  const { data: campaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      return data;
    },
  });

  const { data: adsets = [] } = useQuery({
    queryKey: ['adsets', campaignId],
    queryFn: async () => {
      const { data } = await supabase
        .from('adsets')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{campaign?.name || 'Campaign Details'}</h1>
        <CreateAdSetDialog campaignId={campaignId || ''} />
      </div>
      <AdSetList adsets={adsets} campaignId={campaignId || ''} />
    </div>
  );
}
