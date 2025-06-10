import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, insertWithUser, updateWithUser } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, Search, FileText,
  Calendar, Building, DollarSign, Tag, MoreVertical,
  Trash2, Edit, Download, Upload, AlertTriangle,
  CheckCircle, Clock, XCircle, Repeat
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useDealsView } from '@/hooks/useDealsView';
import { DealForm, DealFormValues } from '@/components/Deals/DealForm';
import { DealKanbanView } from '@/components/Deals/DealKanbanView';
import { MultiStageDealDialog } from '@/components/Deals/MultiStageDealDialog';
import { EditDealDialog } from '@/components/Deals/EditDealDialog';
import { Deal, Stage, Profile } from '@/components/Deals/types/deal';
import { Company } from '@/types/company';

const DealsPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');

  const { toast } = useToast();
  const { isAdmin, isEmployee, user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch deals
  const { data: deals = [], isLoading: isLoadingDeals } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Error fetching deals',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }

      console.log('Fetched deals:', data?.length || 0);
      return data as Deal[];
    },
  });

  // Fetch companies for the dropdown - updated to get complete company data
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) {
        toast({
          title: 'Error fetching companies',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }

      return data as Company[];
    },
  });

  // Fetch stages for the dropdown - use the correct table name
  const { data: stages = [], isLoading: isLoadingStages } = useQuery({
    queryKey: ['deal_stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_stages')
        .select('id, name, position')
        .order('position');
      
      if (error) {
        toast({
          title: 'Error fetching stages',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      console.log('Fetched stages:', data?.length || 0);
      return data as Stage[];
    },
  });

  // Fetch profiles for assigned to dropdown - Updated to include avatar_url
  const { data: profiles = [], isLoading: isLoadingProfiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role, avatar_url')
        .order('first_name');

      if (error) {
        toast({
          title: 'Error fetching profiles',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }

      return data as Profile[];
    },
  });

  // Update stage mutation
  const updateStageMutation = useMutation({
    mutationFn: async ({ dealId, stageId }: { dealId: string; stageId: string }) => {
      console.log(`Updating deal ${dealId} to stage ${stageId}`);
      const { data, error } = await updateWithUser('deals', dealId, {
        stage_id: stageId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: 'Deal updated',
        description: 'Deal stage updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating deal stage',
        description: error.message,
        variant: 'destructive',
      });
      // Force re-fetch to ensure UI is in sync with database after error
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });

  // Create deal mutation
  const createMutation = useMutation({
    mutationFn: async (values: DealFormValues) => {
      // Use the specific Lead stage ID provided
      const leadStageId = "5ac493ab-84be-4203-bb92-b7c310bc2128";
      
      console.log(`Using Lead stage ID: ${leadStageId}`);
      
      const { data, error } = await insertWithUser('deals', {
        title: values.title,
        description: values.description || null,
        company_id: values.company_id === 'none' ? null : values.company_id || null,
        stage_id: leadStageId, // Set the specific Lead stage ID
        value: values.value,
        expected_close_date: null,
        assigned_to: values.assigned_to === 'unassigned' ? null : values.assigned_to || null,
        is_recurring: values.is_recurring,
        deal_type: values.deal_type || null,
        client_deal_type: values.client_deal_type || null,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Deal created',
        description: 'The deal has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating deal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete deal mutation 
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Deal deleted',
        description: 'The deal has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setCurrentDeal(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting deal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle deal stage change
  const handleMoveStage = (dealId: string, newStageId: string) => {
    console.log(`Moving deal ${dealId} to stage ${newStageId}`);
    updateStageMutation.mutate({ dealId, stageId: newStageId });
  };

  // Edit deal
  const handleEdit = (deal: Deal) => {
    console.log('Editing deal:', deal);
    setCurrentDeal(deal);
    setIsEditing(true);
  };

  // Delete deal
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  // Format currency
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Get company name by ID
  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return 'No Company';
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };

  // Get stage name by ID
  const getStageName = (stageId: string | null) => {
    if (!stageId) return 'No Stage';
    const stage = stages.find(s => s.id === stageId);
    return stage ? stage.name : 'Unknown Stage';
  };

  // Get assigned to name by ID
  const getAssignedToName = (assignedTo: string | null) => {
    if (!assignedTo) return 'Unassigned';
    const profile = profiles.find(p => p.id === assignedTo);
    return profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.id : 'Unknown User';
  };

  // Filter deals based on selected stage
  const getFilteredDeals = () => {
    let filtered = deals.filter(deal => {
      const matchesSearch =
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCompanyName(deal.company_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getStageName(deal.stage_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getAssignedToName(deal.assigned_to).toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });

    // Filter by stage if not "all"
    if (selectedStageFilter !== 'all') {
      filtered = filtered.filter(deal => deal.stage_id === selectedStageFilter);
    }

    return filtered;
  };

  const filteredDeals = getFilteredDeals();

  // Check if user can modify deals (admin or employee)
  const canModify = isAdmin || isEmployee;

  const isLoading = isLoadingDeals || isLoadingCompanies || isLoadingStages || isLoadingProfiles;

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 space-y-6 py-4 sm:py-8 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Deals</h1>
        <div className="flex items-center gap-4">
          {canModify && (
            <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Deal
            </Button>
          )}
        </div>
      </div>

      {/* Search bar and stage filter tabs - responsive layout */}
      <div className="mb-6 flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search deals..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex-shrink-0 overflow-x-auto">
          <Tabs value={selectedStageFilter} onValueChange={setSelectedStageFilter}>
            <TabsList className="w-auto min-w-fit">
              <TabsTrigger value="all" className="text-xs sm:text-sm">All Deals</TabsTrigger>
              {stages.map((stage) => (
                <TabsTrigger key={stage.id} value={stage.id} className="text-xs sm:text-sm">
                  {stage.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          <DealKanbanView
            deals={filteredDeals}
            stages={selectedStageFilter === 'all' ? stages : stages.filter(s => s.id === selectedStageFilter)}
            companies={companies}
            profiles={profiles}
            canModify={canModify}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMove={handleMoveStage}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Multi-Stage Edit Dialog */}
      <EditDealDialog
        isOpen={isEditing}
        onClose={() => {
          setIsEditing(false);
          setCurrentDeal(null);
        }}
        deal={currentDeal}
        companies={companies}
        stages={stages}
        profiles={profiles}
      />

      {/* Multi-Stage Deal Dialog */}
      <MultiStageDealDialog
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
      />
    </div>
  );
};

export default DealsPage;
