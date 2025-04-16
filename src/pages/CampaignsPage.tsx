import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client'; // Updated import
import { useToast } from '@/components/ui/use-toast';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CampaignList } from '@/components/Campaigns/CampaignList';
import { Campaign } from '@/components/Campaigns/CampaignCard';
import { useAuth } from '@/contexts/AuthContext';
import { CreateCampaignDialog } from '@/components/Campaigns/CreateCampaignDialog/CreateCampaignDialog';

const CampaignsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const { user, session } = useAuth();

  // Fetch campaigns from Supabase
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        toast({
          title: 'Error fetching campaigns',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Campaign[];
    },
    enabled: !!session?.user?.id, // Only run query if user is authenticated
  });

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show authentication warning if not logged in
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <CreateCampaignDialog />
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search campaigns..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <CampaignList 
        campaigns={filteredCampaigns}
        isLoading={isLoading}
        onCreateClick={() => {}}
      />
    </div>
  );
};

export default CampaignsPage;
