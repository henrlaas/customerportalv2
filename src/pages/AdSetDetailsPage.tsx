import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CampaignDetailsBanner } from '@/components/Campaigns/CampaignDetailsBanner';
import { Campaign } from '@/components/Campaigns/types/campaign';

export function AdSetDetailsPage() {
  const { adsetId } = useParams<{ adsetId: string }>();
  const navigate = useNavigate();
  
  // Fetch the adset details
  const { data: adset } = useQuery({
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
      const { data } = await supabase
        .from('campaigns')
        .select(`
          *,
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
        .eq('id', adset.campaign_id)
        .single();
      
      if (data) {
        const campaignData = {
          ...data,
          status: data.status as any, // Cast to the appropriate CampaignStatus type
        };
        
        return campaignData as unknown as Campaign;
      }
      
      return null;
    },
    enabled: !!adset?.campaign_id,
  });

  return (
    <div>
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
                  <p className="text-sm font-medium text-muted-foreground">Budget</p>
                  <p>${adset.budget || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Targeting</p>
                  <p>{adset.targeting || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p>
                    {adset.start_date && adset.end_date 
                      ? `${new Date(adset.start_date).toLocaleDateString()} - ${new Date(adset.end_date).toLocaleDateString()}`
                      : 'No date range specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p>{new Date(adset.created_at).toLocaleString()}</p>
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
