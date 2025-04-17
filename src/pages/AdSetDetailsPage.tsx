
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AdsList } from '@/components/Campaigns/Ads/AdsList';
import { CreateAdDialog } from '@/components/Campaigns/Ads/CreateAdDialog';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export function AdSetDetailsPage() {
  const { adsetId } = useParams<{ adsetId: string }>();
  const navigate = useNavigate();
  const [selectedAdsetId, setSelectedAdsetId] = useState<string | null>(adsetId || null);

  // Update selected adset when URL param changes
  useEffect(() => {
    if (adsetId) {
      setSelectedAdsetId(adsetId);
    }
  }, [adsetId]);

  // Fetch the campaign from the selected adset
  const { data: selectedAdset } = useQuery({
    queryKey: ['adset', selectedAdsetId],
    queryFn: async () => {
      if (!selectedAdsetId) return null;
      const { data } = await supabase
        .from('adsets')
        .select('*, campaigns(*)')
        .eq('id', selectedAdsetId)
        .single();
      return data;
    },
    enabled: !!selectedAdsetId,
  });

  // Get campaign ID for fetching all adsets
  const campaignId = selectedAdset?.campaigns?.id;

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

  const campaignPlatform = selectedAdset?.campaigns?.platform;

  const handleBackToCampaign = () => {
    if (campaignId) {
      navigate(`/campaigns/${campaignId}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            {campaignId && (
              <Button variant="ghost" size="sm" className="pl-0" onClick={handleBackToCampaign}>
                <ArrowLeft className="h-4 w-4 mr-1" /> 
                Campaign: {selectedAdset?.campaigns?.name || 'Loading...'}
              </Button>
            )}
            {campaignPlatform && (
              <>
                <span>•</span>
                <span>Platform: {campaignPlatform}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold">Ad Sets & Ads</h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Adsets sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 border rounded-lg">
          <div className="p-4 border-b bg-muted/30">
            <h2 className="font-medium text-lg">Ad Sets</h2>
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
                {selectedAdsetId && <CreateAdDialog adsetId={selectedAdsetId} campaignPlatform={campaignPlatform} />}
              </div>
              <AdsList ads={ads} campaignPlatform={campaignPlatform} />
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
