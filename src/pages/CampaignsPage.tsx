
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import * as z from 'zod';
import { CampaignForm, campaignSchema, CampaignInsert } from '@/components/Campaigns/CampaignForm';
import { CampaignList } from '@/components/Campaigns/CampaignList';
import { Campaign } from '@/components/Campaigns/CampaignCard';

const CampaignsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch campaigns from Supabase
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
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
  });

  // Fetch companies for the dropdown
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
        
      if (error) {
        toast({
          title: 'Error fetching companies',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data;
    },
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (values: z.infer<typeof campaignSchema>) => {
      // Convert form values to proper insert type
      const campaignData: CampaignInsert = {
        name: values.name,
        company_id: values.company_id,
        description: values.description || null,
        status: values.status,
        budget: values.budget || null,
        start_date: values.start_date || null,
        end_date: values.end_date || null
      };
      
      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaignData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error creating campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof campaignSchema>) => {
    createCampaignMutation.mutate(values);
  };

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Add a new marketing campaign to your workspace
              </DialogDescription>
            </DialogHeader>
            <CampaignForm 
              onSubmit={onSubmit} 
              isSubmitting={createCampaignMutation.isPending}
              companies={companies}
            />
          </DialogContent>
        </Dialog>
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
        onCreateClick={() => setIsDialogOpen(true)}
      />
    </div>
  );
};

export default CampaignsPage;
