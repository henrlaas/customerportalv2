
import React, { useState } from 'react';
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

const CampaignsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('all');
  const { user, session } = useAuth();

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
  });

  // Filter campaigns based on search term and status
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
    return matchesSearch && matchesStatus;
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

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search campaigns..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs defaultValue="all" value={status} onValueChange={setStatus} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
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
