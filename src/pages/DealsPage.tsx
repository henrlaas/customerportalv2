import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart, 
  Plus,
  Search,
  Filter,
  DollarSign,
  Building,
  Calendar,
  Percent,
  User,
  MoreVertical,
  Trash2,
  Edit,
  ChevronRight,
  MoveRight
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Slider } from '@/components/ui/slider';

// Deal form schema
const dealSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  company_id: z.string().optional(),
  stage_id: z.string().optional(),
  expected_close_date: z.string().optional(),
  value: z.string().optional().transform(val => val ? parseFloat(val) : null),
  probability: z.number().min(0).max(100).optional(),
  assigned_to: z.string().optional(),
});

// Deal type matching our database schema
type Deal = {
  id: string;
  title: string;
  description: string | null;
  company_id: string | null;
  stage_id: string | null;
  expected_close_date: string | null;
  value: number | null;
  probability: number | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

// Company type for selecting related companies
type Company = {
  id: string;
  name: string;
};

// Stage type for pipeline stages
type Stage = {
  id: string;
  name: string;
  position: number;
};

// User/Profile type for assigning deals
type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

const DealsPage = () => {
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { toast } = useToast();
  const { isAdmin, isEmployee, user } = useAuth();
  const queryClient = useQueryClient();
  
  // Form for creating/editing deals
  const form = useForm({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: '',
      description: '',
      company_id: '',
      stage_id: '',
      expected_close_date: '',
      value: '',
      probability: 50,
      assigned_to: '',
    },
  });
  
  // Simplified form for moving deals between stages
  const moveForm = useForm({
    defaultValues: {
      stage_id: '',
    },
  });
  
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
    mutationFn: async (values: z.infer<typeof dealSchema>) => {
      const { data, error } = await supabase
        .from('deals')
        .insert([{
          title: values.title,
          description: values.description || null,
          company_id: values.company_id || null,
          stage_id: values.stage_id || null,
          expected_close_date: values.expected_close_date || null,
          value: values.value,
          probability: values.probability || null,
          assigned_to: values.assigned_to || null
        }])
        .select();
      
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
      form.reset();
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
    mutationFn: async (values: z.infer<typeof dealSchema> & { id: string }) => {
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
      form.reset();
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
      moveForm.reset();
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
  const onSubmit = (values: z.infer<typeof dealSchema>) => {
    if (isEditing && currentDeal) {
      updateMutation.mutate({ ...values, id: currentDeal.id });
    } else {
      createMutation.mutate(values);
    }
  };
  
  // Submit handler for the move deal form
  const onMoveSubmit = (values: { stage_id: string }) => {
    if (!currentDeal) return;
    
    moveDealMutation.mutate({
      id: currentDeal.id,
      stage_id: values.stage_id,
    });
  };
  
  // Edit deal
  const handleEdit = (deal: Deal) => {
    form.reset({
      title: deal.title,
      description: deal.description || '',
      company_id: deal.company_id || '',
      stage_id: deal.stage_id || '',
      expected_close_date: deal.expected_close_date ? deal.expected_close_date.split('T')[0] : '',
      value: deal.value?.toString() || '',
      probability: deal.probability || 50,
      assigned_to: deal.assigned_to || '',
    });
    setCurrentDeal(deal);
    setIsEditing(true);
  };
  
  // Open move deal dialog
  const handleMove = (deal: Deal) => {
    moveForm.reset({
      stage_id: deal.stage_id || '',
    });
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
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Get company name by ID
  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return 'No company';
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };
  
  // Get stage name by ID
  const getStageName = (stageId: string | null) => {
    if (!stageId) return 'No stage';
    const stage = stages.find(s => s.id === stageId);
    return stage ? stage.name : 'Unknown Stage';
  };
  
  // Get user name by ID
  const getAssigneeName = (userId: string | null) => {
    if (!userId) return 'Unassigned';
    const profile = profiles.find(p => p.id === userId);
    if (!profile) return 'Unknown User';
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Marketing Campaign Deal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="company_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a company (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No company</SelectItem>
                              {companies.map(company => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stage_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deal Stage</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a stage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stages.map(stage => (
                                <SelectItem key={stage.id} value={stage.id}>
                                  {stage.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deal Value</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="10000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expected_close_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Close Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="probability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Deal Probability: {field.value}%
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            defaultValue={[field.value || 50]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="assigned_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned To</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Assign to (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Unassigned</SelectItem>
                            {profiles.map(profile => (
                              <SelectItem key={profile.id} value={profile.id}>
                                {`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          <Textarea 
                            placeholder="Add any details about the deal"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" onClick={() => form.reset()}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Creating...' : 'Create Deal'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Marketing Campaign Deal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a company (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No company</SelectItem>
                          {companies.map(company => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stage_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Stage</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stages.map(stage => (
                            <SelectItem key={stage.id} value={stage.id}>
                              {stage.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Value</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expected_close_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Close Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="probability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Deal Probability: {field.value}%
                    </FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        defaultValue={[field.value || 50]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {profiles.map(profile => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <Textarea 
                        placeholder="Add any details about the deal"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setCurrentDeal(null);
                    form.reset();
                  }}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
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
          <form onSubmit={moveForm.handleSubmit(onMoveSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Current Stage: {getStageName(currentDeal?.stage_id)}
              </label>
              <Select
                onValueChange={(value) => moveForm.setValue('stage_id', value)}
                defaultValue={currentDeal?.stage_id || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a new stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={() => {
                  setIsMoving(false);
                  setCurrentDeal(null);
                  moveForm.reset();
                }}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit" 
                disabled={moveDealMutation.isPending || moveForm.getValues().stage_id === currentDeal?.stage_id}
              >
                {moveDealMutation.isPending ? 'Moving...' : 'Move Deal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Deal Card Component
interface DealCardProps {
  deal: Deal;
  companies: Company[];
  stages: Stage[];
  profiles: Profile[];
  canModify: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onMove: (deal: Deal) => void;
}

const DealCard = ({ 
  deal, 
  companies, 
  stages, 
  profiles,
  canModify, 
  onEdit, 
  onDelete,
  onMove
}: DealCardProps) => {
  // Get company name
  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return 'No company';
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };
  
  // Get user name
  const getAssigneeName = (userId: string | null) => {
    if (!userId) return 'Unassigned';
    const profile = profiles.find(p => p.id === userId);
    if (!profile) return 'Unknown User';
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
  };
  
  // Format currency
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold">{deal.title}</CardTitle>
          {canModify && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-3.5
