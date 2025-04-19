import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AdsList } from '@/components/Campaigns/Ads/AdsList';
import { CreateAdSetDialog } from '@/components/Campaigns/Adsets/CreateAdSetDialog';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';
import { CreateAdDialog } from '@/components/Campaigns/Ads/CreateAdDialog';
import { AdSetList } from '@/components/Campaigns/Adsets/AdSetList';

export function CampaignDetailsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [selectedAdsetId, setSelectedAdsetId] = useState<string | null>(null);

  // Fetch the campaign details
  const { data: campaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      return data;
    },
    enabled: !!campaignId,
  });

  // Fetch all adsets for this campaign
  const { data: allAdsets = [] } = useQuery({
    queryKey: ['adsets', campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const { data } = await supabase
        .from('adsets')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!campaignId,
  });

  // Set the first adset as selected when data is loaded
  useEffect(() => {
    if (allAdsets.length > 0 && !selectedAdsetId) {
      setSelectedAdsetId(allAdsets[0].id);
    }
  }, [allAdsets, selectedAdsetId]);

  // Fetch ads for the selected adset
  const { data: ads = [] } = useQuery({
    queryKey: ['ads', selectedAdsetId],
    queryFn: async () => {
      if (!selectedAdsetId) return [];
      const { data } = await supabase
        .from('ads')
        .select('*')
        .eq('adset_id', selectedAdsetId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!selectedAdsetId,
  });

  // Fetch the selected adset details
  const { data: selectedAdset } = useQuery({
    queryKey: ['adset', selectedAdsetId],
    queryFn: async () => {
      if (!selectedAdsetId) return null;
      const { data } = await supabase
        .from('adsets')
        .select('*')
        .eq('id', selectedAdsetId)
        .single();
      return data;
    },
    enabled: !!selectedAdsetId,
  });

  // Refetch function to refresh data
  const { refetch: refetchAdsets } = useQuery({
    queryKey: ['adsets', campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const { data } = await supabase
        .from('adsets')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!campaignId,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>Campaign: {campaign?.name || 'Loading...'}</span>
            {campaign?.platform && (
              <>
                <span>•</span>
                <span>Platform: {campaign.platform}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold">Ad Sets & Ads</h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Adsets sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 border rounded-lg">
          <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
            <h2 className="font-medium text-lg">Ad Sets</h2>
            {campaignId && <CreateAdSetDialog campaignId={campaignId} />}
          </div>
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="p-2">
              {allAdsets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No ad sets available</p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {allAdsets.map((adset) => (
                    <li key={adset.id}>
                      <Button
                        variant={adset.id === selectedAdsetId ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          adset.id === selectedAdsetId && "font-medium"
                        )}
                        onClick={() => setSelectedAdsetId(adset.id)}
                      >
                        {adset.name}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Ads content area */}
        <div className="flex-1">
          {selectedAdsetId ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">
                  {selectedAdset?.name} 
                  {selectedAdset?.targeting && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({selectedAdset.targeting})
                    </span>
                  )}
                </h2>
                {selectedAdsetId && <CreateAdDialog adsetId={selectedAdsetId} campaignPlatform={campaign?.platform} />}
              </div>
              <AdsList ads={ads} campaignPlatform={campaign?.platform} />
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-medium mb-2">Select an Ad Set</h3>
              <p className="text-muted-foreground">Choose an ad set from the sidebar to view its ads.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
