
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Calendar, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

// Define Campaign type
type Campaign = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  company_id: string;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

// Campaign form schema - update to match Supabase requirements
const campaignSchema = z.object({
  name: z.string().min(1, { message: 'Campaign name is required' }),
  description: z.string().optional(),
  status: z.string().default('draft'),
  company_id: z.string().min(1, { message: 'Company is required' }),
  budget: z.number().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
});

// Define the insert type that matches what Supabase expects
type CampaignInsert = {
  name: string;
  description?: string | null;
  status: string;
  company_id: string;
  budget?: number | null;
  start_date?: string | null;
  end_date?: string | null;
};

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

  // Create campaign mutation - fixed to properly handle the types
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
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Setup form with zod resolver
  const form = useForm<z.infer<typeof campaignSchema>>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'draft',
      company_id: '',
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

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

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

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter campaign name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Campaign description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <select
                          className="w-full rounded-md border border-gray-300 p-2"
                          {...field}
                        >
                          <option value="">Select Company</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <select
                            className="w-full rounded-md border border-gray-300 p-2"
                            {...field}
                          >
                            <option value="draft">Draft</option>
                            <option value="planning">Planning</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Campaign budget" 
                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createCampaignMutation.isPending}
                  >
                    {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
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

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
          <p className="text-muted-foreground mb-4">Create your first campaign to get started</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader className="pb-2">
                <CardTitle>{campaign.name}</CardTitle>
                <CardDescription>{campaign.description || 'No description'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  Last updated: {formatDate(campaign.updated_at)}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className={`inline-flex items-center rounded-full ${getStatusBadgeColor(campaign.status)} px-2.5 py-0.5 text-xs font-medium`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                  <Button variant="link" className="text-blue-600 hover:text-blue-800">
                    View Details
                  </Button>
                </div>
                {campaign.budget && (
                  <div className="mt-2 flex items-center text-sm">
                    <Tag className="h-4 w-4 mr-1 text-gray-500" />
                    Budget: ${campaign.budget}
                  </div>
                )}
                {campaign.start_date && (
                  <div className="mt-2 flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                    {formatDate(campaign.start_date)} to {formatDate(campaign.end_date)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
