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
import { Campaign, CampaignStatus, Platform } from '@/components/Campaigns/types/campaign';

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
        // First fetch the campaign data without joining to profiles
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
          
          // Initialize with campaign data and properly cast platform as Platform type
          const campaignData: Campaign = {
            ...data,
            status: data.status as CampaignStatus,
            platform: data.platform as Platform, // Cast platform string to Platform type
          };
          
          // Check if we need to fetch associated user info
          if (data.associated_user_id) {
            try {
              const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('first_name, last_name, avatar_url')
                .eq('id', data.associated_user_id)
                .single();
              
              if (!userError && userData) {
                campaignData.profiles = userData;
              } else {
                console.log('No user profile found or error fetching user profile');
                campaignData.profiles = null;
              }
            } catch (userError) {
              console.error('Error fetching associated user:', userError);
              campaignData.profiles = { error: true };
            }
          }
          
          return campaignData;
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

  // Determine if modifications should be disabled
  const campaignStatus = campaign?.status?.toLowerCase?.() || '';
  const disableModifications = ['ready', 'published', 'archived'].includes(campaignStatus);

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

  // New: AdSet selector handler for sidebar menu
  const handleSelectAdset = (adsetId: string) => {
    setSelectedAdsetId(adsetId);
  };

  // Create a placeholder campaign if the real campaign data isn't available
  const displayCampaign: Campaign | null = campaign || (campaignId ? {
    id: campaignId,
    name: 'Loading Campaign...',
    status: 'draft' as CampaignStatus,
    platform: 'Meta' as Platform, // Properly cast as Platform type
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
              {campaignId && <CreateAdSetDialog campaignId={campaignId} disabled={disableModifications} />}
            </div>
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="p-2">
                <AdSetList
                  adsets={allAdsets}
                  campaignId={campaignId!}
                  onUpdate={handleAdsetUpdate}
                  disableModifications={disableModifications}
                  selectedAdsetId={selectedAdsetId}
                  onSelectAdset={handleSelectAdset}
                />
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
                  {selectedAdsetId && (
                    <CreateAdDialog adsetId={selectedAdsetId} campaignPlatform={campaign?.platform} disabled={disableModifications} />
                  )}
                </div>
                <AdsList ads={ads} campaignPlatform={campaign?.platform} disableModifications={disableModifications} />
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
