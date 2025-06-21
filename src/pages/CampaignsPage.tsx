import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CampaignList } from '@/components/Campaigns/CampaignList';
import { Campaign } from '@/components/Campaigns/types/campaign';
import { useAuth } from '@/contexts/AuthContext';
import { CreateCampaignDialog } from '@/components/Campaigns/CreateCampaignDialog/CreateCampaignDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealtimeCampaigns } from '@/hooks/realtime/useRealtimeCampaigns';
import { useRealtimeAds } from '@/hooks/realtime/useRealtimeAds';
import { useRealtimeAdsets } from '@/hooks/realtime/useRealtimeAdsets';
import { UserSelect } from '@/components/Deals/UserSelect';
import { StatusSelect } from '@/components/Campaigns/StatusSelect';
import { PlatformSelector } from '@/components/Campaigns/PlatformSelector';
import { Platform } from '@/components/Campaigns/types/campaign';

const CampaignsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['Meta', 'Google', 'LinkedIn', 'Snapchat', 'Tiktok']);
  const { user, session } = useAuth();
  const hasSetInitialUser = useRef(false);

  // Enable real-time updates for campaigns, ads, and adsets
  useRealtimeCampaigns({ enabled: !!session?.user?.id });
  useRealtimeAds({ enabled: !!session?.user?.id });
  useRealtimeAdsets({ enabled: !!session?.user?.id });

  // Set current user as default selected user only on initial load
  React.useEffect(() => {
    if (user?.id && !hasSetInitialUser.current) {
      setSelectedUserId(user.id);
      hasSetInitialUser.current = true;
    }
  }, [user?.id]);

  // Fetch all profiles for the user selector
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, role')
        .order('first_name', { ascending: true });
      
      if (error) {
        console.error('Error fetching profiles:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!session?.user?.id,
  });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        return [];
      }
      
      // Avoid using joins with associated_user_id as it's causing schema issues
      const { data, error } = await supabase
        .from('campaigns')
        .select('*, companies:company_id(name)')
        .order('created_at', { ascending: false });
        
      if (error) {
        toast({
          title: 'Error fetching campaigns',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      // If we need user profile data, fetch it separately for campaigns with associated_user_id
      const campaignsWithProfiles = await Promise.all(
        data.map(async (campaign) => {
          if (campaign.associated_user_id) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name, avatar_url')
              .eq('id', campaign.associated_user_id)
              .single();
              
            return {
              ...campaign,
              profiles: profileError ? { error: true } : profileData
            };
          }
          
          return {
            ...campaign,
            profiles: null
          };
        })
      );
      
      return campaignsWithProfiles as Campaign[];
    },
    enabled: !!session?.user?.id,
    staleTime: 0, // Always fetch fresh data for real-time updates
  });

  // Filter campaigns based on search term, status, selected user, and selected platforms
  const filteredCampaigns = campaigns.filter(campaign => {
    // Helper function to safely check if profiles exist and are not an error object
    const isValidProfile = (profile: any): profile is { first_name: string | null, last_name: string | null } => {
      return profile && !('error' in profile);
    };
    
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (campaign.companies?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (isValidProfile(campaign.profiles) && 
        `${campaign.profiles.first_name || ''} ${campaign.profiles.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = status === 'all' || campaign.status.toLowerCase() === status.toLowerCase();
    
    // User filter logic - show all campaigns when selectedUserId is null
    const matchesUser = selectedUserId === null || campaign.associated_user_id === selectedUserId;
    
    // Platform filter logic - show campaigns whose platform is in selectedPlatforms
    const matchesPlatform = selectedPlatforms.includes(campaign.platform);
    
    return matchesSearch && matchesStatus && matchesUser && matchesPlatform;
  });

  const handleCreateClick = () => {
    // This function can be used to trigger the create dialog if needed
  };

  if (!session?.user?.id) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <div className="text-center p-12 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p className="text-muted-foreground mb-4">Please log in to access campaigns</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-4 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <CreateCampaignDialog />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search campaigns..."
            className="pl-9 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 items-center flex-shrink-0">
          <UserSelect
            profiles={allProfiles}
            selectedUserId={selectedUserId}
            onUserChange={setSelectedUserId}
            currentUserId={user?.id}
            allUsersLabel="Show all"
          />
          <StatusSelect
            selectedStatus={status}
            onStatusChange={setStatus}
          />
          <PlatformSelector
            selectedPlatforms={selectedPlatforms}
            onPlatformsChange={setSelectedPlatforms}
          />
        </div>
      </div>

      <CampaignList 
        campaigns={filteredCampaigns}
        isLoading={isLoading}
        onCreateClick={handleCreateClick}
      />
    </div>
  );
};

export default CampaignsPage;
