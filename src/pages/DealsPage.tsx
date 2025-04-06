import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, insertWithUser } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart, 
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DealCard, Deal, Company, Stage, Profile } from '@/components/Deals/DealCard';
import { DealForm, DealFormValues } from '@/components/Deals/DealForm';
import { MoveDealForm } from '@/components/Deals/MoveDealForm';

const DealsPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
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
      
      return data as Deal[];
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
      
      return data as Company[];
    },
  });
  
  // Fetch pipeline stages
  const { data: stages = [], isLoading: isLoadingStages } = useQuery({
    queryKey: ['deal_stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_stages')
        .select('*')
        .order('position');
      
      if (error) {
        toast({
          title: 'Error fetching pipeline stages',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Stage[];
    },
  });
  
  // Fetch users/profiles
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .order('first_name');
      
      if (error) {
        toast({
          title: 'Error fetching users',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Profile[];
    },
  });
  
  // Create deal mutation
  const createMutation = useMutation({
    mutationFn: async (values: DealFormValues) => {
      const { data, error } = await insertWithUser('deals', {
        title: values.title,
        description: values.description || null,
        company_id: values.company_id || null,
        stage_id: values.stage_id || null,
        expected_close_date: values.expected_close_date || null,
        value: values.value,
        probability: values.probability || null,
        assigned_to: values.assigned_to || null
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
    onError: (error) => {
      toast({
        title: 'Error creating deal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update deal mutation
  const updateMutation = useMutation({
    mutationFn: async (values: DealFormValues & { id: string }) => {
      const { id, ...dealData } = values;
      const { data, error } = await supabase
        .from('deals')
        .update({
          title: dealData.title,
          description: dealData.description || null,
          company_id: dealData.company_id || null,
          stage_id: dealData.stage_id || null,
          expected_close_date: dealData.expected_close_date || null,
          value: dealData.value,
          probability: dealData.probability || null,
          assigned_to: dealData.assigned_to || null
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Deal updated',
        description: 'The deal has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setIsEditing(false);
      setCurrentDeal(null);
    },
    onError: (error) => {
      toast({
        title: 'Error updating deal',
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
    onError: (error) => {
      toast({
        title: 'Error deleting deal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Move deal to another stage mutation
  const moveDealMutation = useMutation({
    mutationFn: async ({ id, stage_id }: { id: string; stage_id: string }) => {
      const { data, error } = await supabase
        .from('deals')
        .update({ stage_id })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Deal moved',
        description: 'The deal has been moved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setIsMoving(false);
    },
    onError: (error) => {
      toast({
        title: 'Error moving deal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Submit handler for the create/edit form
  const handleSubmit = (values: DealFormValues) => {
    if (isEditing && currentDeal) {
      updateMutation.mutate({ ...values, id: currentDeal.id });
    } else {
      createMutation.mutate(values);
    }
  };
  
  // Submit handler for the move deal form
  const handleMoveSubmit = (values: { stage_id: string }) => {
    if (!currentDeal) return;
    
    moveDealMutation.mutate({
      id: currentDeal.id,
      stage_id: values.stage_id,
    });
  };
  
  // Edit deal
  const handleEdit = (deal: Deal) => {
    const formValues = {
      title: deal.title,
      description: deal.description || '',
      company_id: deal.company_id || '',
      stage_id: deal.stage_id || '',
      expected_close_date: deal.expected_close_date ? deal.expected_close_date.split('T')[0] : '',
      value: deal.value?.toString() || '',
      probability: deal.probability || 50,
      assigned_to: deal.assigned_to || '',
    };
    
    setCurrentDeal(deal);
    setIsEditing(true);
  };
  
  // Open move deal dialog
  const handleMove = (deal: Deal) => {
    setCurrentDeal(deal);
    setIsMoving(true);
  };
  
  // Delete deal
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };
  
  // Format currency
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Get stage name by ID
  const getStageName = (stageId: string | null) => {
    if (!stageId) return 'No stage';
    const stage = stages.find(s => s.id === stageId);
    return stage ? stage.name : 'Unknown Stage';
  };
  
  // Calculate total pipeline value
  const totalPipelineValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  
  // Calculate weighted pipeline value (value * probability)
  const weightedPipelineValue = deals.reduce((sum, deal) => 
    sum + (deal.value || 0) * ((deal.probability || 0) / 100), 0
  );
  
  // Group deals by stage for kanban view
  const dealsByStage = stages.map(stage => ({
    stage,
    deals: deals.filter(deal => 
      deal.stage_id === stage.id && 
      (searchQuery === '' || 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCompanyName(deal.company_id).toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  }));
  
  // Get company name by ID
  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return 'No company';
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };
  
  // Check if user can modify deals (admin or employee)
  const canModify = isAdmin || isEmployee;
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Deals</h1>
          <div className="mt-2 text-gray-500">
            Pipeline value: {formatCurrency(totalPipelineValue)} 
            <span className="ml-2 text-sm">
              (Expected: {formatCurrency(weightedPipelineValue)})
            </span>
          </div>
        </div>
        {canModify && (
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
                <DialogDescription>
                  Add a new deal to your pipeline.
                </DialogDescription>
              </DialogHeader>
              <DealForm 
                onSubmit={handleSubmit}
                companies={companies}
                stages={stages}
                profiles={profiles}
                isSubmitting={createMutation.isPending}
                submitLabel="Create Deal"
                onCancel={() => setIsCreating(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search deals..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
      
      {isLoadingDeals || isLoadingStages ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="flex overflow-x-auto pb-6 gap-4">
          {dealsByStage.map(({ stage, deals }) => (
            <div 
              key={stage.id} 
              className="min-w-[320px] w-[320px] bg-gray-50 rounded-lg p-4 border"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-700">{stage.name}</h3>
                <Badge variant="outline">{deals.length}</Badge>
              </div>
              <div className="space-y-3">
                {deals.map(deal => (
                  <DealCard 
                    key={deal.id} 
                    deal={deal}
                    companies={companies}
                    stages={stages}
                    profiles={profiles}
                    canModify={canModify}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onMove={handleMove}
                  />
                ))}
                {deals.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No deals in this stage
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Edit Deal Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
            <DialogDescription>
              Update the deal information.
            </DialogDescription>
          </DialogHeader>
          {currentDeal && (
            <DealForm 
              onSubmit={(values) => handleSubmit(values)}
              companies={companies}
              stages={stages}
              profiles={profiles}
              defaultValues={{
                title: currentDeal.title,
                description: currentDeal.description || '',
                company_id: currentDeal.company_id || '',
                stage_id: currentDeal.stage_id || '',
                expected_close_date: currentDeal.expected_close_date ? currentDeal.expected_close_date.split('T')[0] : '',
                value: currentDeal.value?.toString() || '',
                probability: currentDeal.probability || 50,
                assigned_to: currentDeal.assigned_to || '',
              }}
              isSubmitting={updateMutation.isPending}
              submitLabel="Save Changes"
              onCancel={() => {
                setIsEditing(false);
                setCurrentDeal(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Move Deal Dialog */}
      <Dialog open={isMoving} onOpenChange={setIsMoving}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Deal</DialogTitle>
            <DialogDescription>
              Move "{currentDeal?.title}" to another stage.
            </DialogDescription>
          </DialogHeader>
          <MoveDealForm 
            stages={stages}
            currentDeal={currentDeal}
            onSubmit={handleMoveSubmit}
            isSubmitting={moveDealMutation.isPending}
            onCancel={() => {
              setIsMoving(false);
              setCurrentDeal(null);
            }}
            getStageName={getStageName}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DealsPage;
