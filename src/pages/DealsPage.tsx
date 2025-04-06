import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, insertWithUser, updateWithUser } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Building,
  DollarSign,
  Tag,
  MoreVertical,
  Trash2,
  Edit,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DealForm, DealFormValues } from '@/components/Deals/DealForm';

// Deal type matching our database schema
export type Deal = {
  id: string;
  title: string;
  description: string | null;
  company_id: string | null;
  stage_id: string | null;
  value: number | null;
  probability: number | null;
  expected_close_date: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

// Company type for selecting related companies
export type Company = {
  id: string;
  name: string;
};

// Stage type for deal stages, making sure it matches DealCard's Stage type
export type Stage = {
  id: string;
  name: string;
  position: number;
};

// Profile type for assigned to
export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

const DealsPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  const { toast } = useToast();
  const { isAdmin, isEmployee } = useAuth();
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
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
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

  // Fetch stages for the dropdown - fix table name
  const { data: stages = [], isLoading: isLoadingStages } = useQuery({
    queryKey: ['stages'],
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
      
      return data as Stage[];
    },
  });

  // Fetch profiles for assigned to dropdown
  const { data: profiles = [], isLoading: isLoadingProfiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
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

  // Fix the value property type issue
  const createMutation = useMutation({
    mutationFn: async (values: DealFormValues) => {
      // Make sure value is number or null
      const numericValue = values.value !== undefined ? Number(values.value) : null;
      
      const { data, error } = await insertWithUser('deals', {
        title: values.title,
        description: values.description || null,
        company_id: values.company_id || null,
        stage_id: values.stage_id || null,
        value: numericValue,
        probability: values.probability || null,
        expected_close_date: values.expected_close_date || null,
        assigned_to: values.assigned_to || null,
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

  // Update deal mutation - fix value type issue
  const updateMutation = useMutation({
    mutationFn: async (values: DealFormValues & { id: string }) => {
      const { id, ...dealData } = values;

      // Make sure value is number or null
      const numericValue = dealData.value !== undefined ? Number(dealData.value) : null;

      const { data, error } = await updateWithUser('deals', id, {
        title: dealData.title,
        description: dealData.description || null,
        company_id: dealData.company_id || null,
        stage_id: dealData.stage_id || null,
        value: numericValue,
        probability: dealData.probability || null,
        expected_close_date: dealData.expected_close_date || null,
        assigned_to: dealData.assigned_to || null,
      });

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
    onError: (error: any) => {
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
    onError: (error: any) => {
      toast({
        title: 'Error deleting deal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Edit deal
  const handleEdit = (deal: Deal) => {
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  // Get status badge (example statuses, adjust as needed)
  const getStatusBadge = (deal: Deal) => {
    const { expected_close_date } = deal;
    const closeDate = expected_close_date ? new Date(expected_close_date) : null;
    const now = new Date();

    if (!closeDate) {
      return <Badge variant="outline">No Close Date</Badge>;
    }

    if (closeDate < now) {
      return <Badge variant="destructive">Overdue</Badge>;
    }

    // You can add more sophisticated logic here based on your deal stages
    return <Badge variant="default">Active</Badge>;
  };

  // Filter deals by search query
  const filteredDeals = deals.filter(deal => {
    const matchesSearch =
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCompanyName(deal.company_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getStageName(deal.stage_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getAssignedToName(deal.assigned_to).toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Check if user can modify deals (admin or employee)
  const canModify = isAdmin || isEmployee;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Deals</h1>
        {canModify && (
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Deal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
                <DialogDescription>
                  Add a new deal to your database.
                </DialogDescription>
              </DialogHeader>
              <DealForm
                onSubmit={(values) => {
                  createMutation.mutate(values);
                }}
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

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
      </div>

      {isLoadingDeals || isLoadingCompanies || isLoadingStages || isLoadingProfiles ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeals.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No deals found. Add your first deal to get started.
            </div>
          ) : (
            filteredDeals.map(deal => (
              <Card key={deal.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <CardTitle className="text-lg">{deal.title}</CardTitle>
                      <div className="ml-2">{getStatusBadge(deal)}</div>
                    </div>
                    {canModify && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(deal)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(deal.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Company:</span>
                      <span className="font-medium ml-1">
                        {getCompanyName(deal.company_id)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Stage:</span>
                      <span className="font-medium ml-1">
                        {getStageName(deal.stage_id)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Value:</span>
                      <span className="font-medium ml-1">
                        {formatCurrency(deal.value)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Close Date:</span>
                      <span className="font-medium ml-1">
                        {formatDate(deal.expected_close_date)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Assigned To:</span>
                      <span className="font-medium ml-1">
                        {getAssignedToName(deal.assigned_to)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Deal Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
            <DialogDescription>
              Update the deal information.
            </DialogDescription>
          </DialogHeader>
          {currentDeal && (
            <DealForm
              onSubmit={(values) => {
                updateMutation.mutate({ ...values, id: currentDeal.id });
              }}
              companies={companies}
              stages={stages}
              profiles={profiles}
              defaultValues={{
                title: currentDeal.title,
                description: currentDeal.description || '',
                company_id: currentDeal.company_id || '',
                stage_id: currentDeal.stage_id || '',
                value: currentDeal.value?.toString() || '',
                probability: currentDeal.probability || 50,
                expected_close_date: currentDeal.expected_close_date || '',
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
    </div>
  );
};

export default DealsPage;
