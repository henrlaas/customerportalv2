
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CampaignDetailsBanner } from '@/components/Campaigns/CampaignDetailsBanner';
import { Campaign, CampaignStatus, Platform } from '@/components/Campaigns/types/campaign';

export function AdSetDetailsPage() {
  const { adsetId } = useParams<{ adsetId: string }>();
  const navigate = useNavigate();
  
  // Fetch the adset details
  const { data: adset, isLoading: isLoadingAdset } = useQuery({
    queryKey: ['adset', adsetId],
    queryFn: async () => {
      if (!adsetId) return null;
      const { data } = await supabase
        .from('adsets')
        .select('*')
        .eq('id', adsetId)
        .single();
      return data;
    },
    enabled: !!adsetId,
  });
  
  // Fetch the campaign details associated with this adset
  const { data: campaign, refetch: refetchCampaign } = useQuery({
    queryKey: ['campaign', adset?.campaign_id],
    queryFn: async () => {
      if (!adset?.campaign_id) return null;
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
            )
          `)
          .eq('id', adset.campaign_id)
          .single();
        
        if (error) {
          console.error('Error fetching campaign:', error);
          throw error;
        }
        
        if (data) {
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
        
        return null;
      } catch (error) {
        console.error('Failed to fetch campaign details:', error);
        throw error;
      }
    },
    enabled: !!adset?.campaign_id,
  });

  return (
    <div>
      {/* Display the campaign banner at the top of the page */}
      <CampaignDetailsBanner campaign={campaign} onCampaignUpdate={refetchCampaign} />
      
      {/* Rest of the AdSetDetailsPage content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Ad Set Details: {adset?.name}</h1>
        
        {/* You can add more content related to the adset here */}
        <div className="grid gap-6">
          <div className="p-6 border rounded-lg shadow-sm bg-card">
            <h2 className="text-xl font-semibold mb-4">Ad Set Information</h2>
            {adset ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Targeting</p>
                  <p>{adset.targeting || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Campaign ID</p>
                  <p>{adset.campaign_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p>{new Date(adset.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                  <p>{new Date(adset.updated_at).toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <p>Loading ad set details...</p>
            )}
          </div>
          
          {/* Add button to view campaign */}
          {adset?.campaign_id && (
            <div className="flex justify-end">
              <button 
                onClick={() => navigate(`/campaigns/${adset.campaign_id}`)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                View Campaign Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
