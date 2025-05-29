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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/20">
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
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-8 h-full">
          {/* Enhanced Adsets sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-lg">Ad Sets</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {allAdsets.length} ad set{allAdsets.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {campaignId && (
                    <CreateAdSetDialog 
                      campaignId={campaignId} 
                      disabled={disableModifications} 
                    />
                  )}
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="p-4">
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
          </div>

          {/* Enhanced Ads content area */}
          <div className="flex-1 min-w-0">
            {selectedAdsetId ? (
              <div className="space-y-6">
                {/* Header with adset info and create button */}
                <div className="bg-card rounded-xl shadow-sm border p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {selectedAdset?.name}
                      </h2>
                      {selectedAdset?.targeting && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">Targeting:</span> {selectedAdset.targeting}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{ads.length} ad{ads.length !== 1 ? 's' : ''}</span>
                        {ads.length > 0 && (
                          <>
                            <span>•</span>
                            <span>
                              {ads.filter(ad => ad.ad_type === 'image').length} image, {' '}
                              {ads.filter(ad => ad.ad_type === 'video').length} video, {' '}
                              {ads.filter(ad => ad.ad_type === 'text' || !ad.ad_type).length} text
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {selectedAdsetId && (
                      <CreateAdDialog 
                        adsetId={selectedAdsetId} 
                        campaignPlatform={campaign?.platform} 
                        disabled={disableModifications} 
                      />
                    )}
                  </div>
                </div>

                {/* Ads list with enhanced design */}
                <div className="bg-card rounded-xl shadow-sm border p-6">
                  <AdsList 
                    ads={ads} 
                    campaignPlatform={campaign?.platform} 
                    disableModifications={disableModifications} 
                  />
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-xl shadow-sm border p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Select an Ad Set</h3>
                  <p className="text-muted-foreground">
                    Choose an ad set from the sidebar to view and manage its ads.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
