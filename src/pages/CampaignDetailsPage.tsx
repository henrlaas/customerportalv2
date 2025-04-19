
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CreateAdSetDialog } from '@/components/Campaigns/Adsets/CreateAdSetDialog';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';
import { CreateAdDialog } from '@/components/Campaigns/Ads/CreateAdDialog';
import { Edit, Trash2 } from 'lucide-react';
import { EditAdSetDialog } from '@/components/Campaigns/Adsets/EditAdSetDialog';
import { DeleteAdSetDialog } from '@/components/Campaigns/Adsets/DeleteAdSetDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CampaignDetailsBanner } from '@/components/Campaigns/CampaignDetailsBanner';
import { AdSetList } from '@/components/Campaigns/Adsets/AdSetList';
import { AdsList } from '@/components/Campaigns/Ads/AdsList';
import { Campaign, CampaignStatus } from '@/components/Campaigns/types/campaign';

export function CampaignDetailsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [selectedAdsetId, setSelectedAdsetId] = useState<string | null>(null);

  // Fetch the campaign details
  const { data: campaign, isLoading: isLoadingCampaign, error: campaignError, refetch: refetchCampaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      console.log('Fetching campaign with ID:', campaignId);
      
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select(`
            id,
            name,
            description,
            status,
            platform,
            budget,
            company_id,
            associated_user_id,
            created_at,
            is_ongoing,
            start_date,
            end_date,
            companies (
              name,
              logo_url
            ),
            profiles (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('id', campaignId)
          .single();
        
        if (error) {
          console.error('Error fetching campaign:', error);
          throw error;
        }
        
        if (data) {
          console.log('Campaign data received:', data);
          const campaignData = {
            ...data,
            status: data.status as CampaignStatus,
          };
          return campaignData as unknown as Campaign;
        }
        
        console.log('No campaign data found');
        return null;
      } catch (error) {
        console.error('Failed to fetch campaign details:', error);
        throw error;
      }
    },
    enabled: !!campaignId,
    retry: 2,
    retryDelay: 1000, // Retry after 1 second
  });

  // Fetch all adsets for this campaign
  const { data: allAdsets = [], refetch: refetchAdsets } = useQuery({
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

  const handleAdsetUpdate = () => {
    refetchAdsets();
  };

  // Create a placeholder campaign if the real campaign data isn't available
  const displayCampaign: Campaign | null = campaign || (campaignId ? {
    id: campaignId,
    name: 'Loading Campaign...',
    status: 'draft' as CampaignStatus,
    platform: 'Meta',
    created_at: new Date().toISOString(),
    companies: {
      name: 'Loading...'
    }
  } as Campaign : null);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Always render the banner with either real data or placeholder */}
      <CampaignDetailsBanner 
        campaign={displayCampaign} 
        onCampaignUpdate={refetchCampaign} 
      />
      
      {/* Show loading state if campaign is still loading */}
      {isLoadingCampaign && (
        <div className="container mx-auto px-4 py-2 text-center text-muted-foreground">
          Loading campaign details...
        </div>
      )}
      
      {/* Show error if there was an error fetching campaign */}
      {campaignError && (
        <div className="container mx-auto px-4 py-2 text-center text-destructive">
          Error loading campaign: {(campaignError as Error).message}
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
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
                      <li key={adset.id} className="relative group">
                        <Button
                          variant={adset.id === selectedAdsetId ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start text-left font-normal pr-16",
                            adset.id === selectedAdsetId && "font-medium"
                          )}
                          onClick={() => setSelectedAdsetId(adset.id)}
                        >
                          {adset.name}
                        </Button>
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <EditAdSetDialog 
                                  adset={adset} 
                                  onSuccess={handleAdsetUpdate}
                                  trigger={
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                  } 
                                />
                              </TooltipTrigger>
                              <TooltipContent>Edit Ad Set</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DeleteAdSetDialog 
                                  adsetId={adset.id} 
                                  adsetName={adset.name} 
                                  onSuccess={handleAdsetUpdate}
                                  trigger={
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/90">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  } 
                                />
                              </TooltipTrigger>
                              <TooltipContent>Delete Ad Set</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
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
    </div>
  );
}
