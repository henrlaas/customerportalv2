
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  Upload
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

// Contract form schema
const contractSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  company_id: z.string().min(1, { message: 'Company is required' }),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']),
  value: z.string().optional().transform(val => val ? parseFloat(val) : null),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

// Contract type matching our database schema
type Contract = {
  id: string;
  title: string;
  company_id: string;
  status: string;
  value: number | null;
  start_date: string | null;
  end_date: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
};

// Company type for selecting related companies
type Company = {
  id: string;
  name: string;
};

const ContractsPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const { toast } = useToast();
  const { isAdmin, isEmployee } = useAuth();
  const queryClient = useQueryClient();
  
  // Form for creating/editing contracts
  const form = useForm({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      title: '',
      company_id: '',
      status: 'draft' as const,
      value: '',
      start_date: '',
      end_date: '',
    },
  });
  
  // Fetch contracts
  const { data: contracts = [], isLoading: isLoadingContracts } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: 'Error fetching contracts',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Contract[];
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
  
  // Create contract mutation
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof contractSchema>) => {
      const { data, error } = await supabase
        .from('contracts')
        .insert([values])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Contract created',
        description: 'The contract has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setIsCreating(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error creating contract',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update contract mutation
  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof contractSchema> & { id: string }) => {
      const { id, ...contractData } = values;
      const { data, error } = await supabase
        .from('contracts')
        .update(contractData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Contract updated',
        description: 'The contract has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setIsEditing(false);
      setCurrentContract(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error updating contract',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete contract mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Contract deleted',
        description: 'The contract has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setCurrentContract(null);
    },
    onError: (error) => {
      toast({
        title: 'Error deleting contract',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Submit handler for the form
  const onSubmit = (values: z.infer<typeof contractSchema>) => {
    if (isEditing && currentContract) {
      updateMutation.mutate({ ...values, id: currentContract.id });
    } else {
      createMutation.mutate(values);
    }
  };
  
  // Edit contract
  const handleEdit = (contract: Contract) => {
    form.reset({
      title: contract.title,
      company_id: contract.company_id,
      status: contract.status as 'draft' | 'active' | 'completed' | 'cancelled',
      value: contract.value?.toString() || '',
      start_date: contract.start_date || '',
      end_date: contract.end_date || '',
    });
    setCurrentContract(contract);
    setIsEditing(true);
  };
  
  // Delete contract
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
  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown Company';
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };
  
  // Filter contracts by status (if tab selected) and search query
  const filteredContracts = contracts.filter(contract => {
    const matchesStatus = activeTab === 'all' || contract.status === activeTab;
    const matchesSearch = 
      contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCompanyName(contract.company_id).toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  // Check if user can modify contracts (admin or employee)
  const canModify = isAdmin || isEmployee;
  
  // Count contracts by status
  const contractCounts = {
    all: contracts.length,
    draft: contracts.filter(c => c.status === 'draft').length,
    active: contracts.filter(c => c.status === 'active').length,
    completed: contracts.filter(c => c.status === 'completed').length,
    cancelled: contracts.filter(c => c.status === 'cancelled').length,
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contracts</h1>
        {canModify && (
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Contract
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Contract</DialogTitle>
                <DialogDescription>
                  Add a new contract to your database.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Marketing Services Agreement" {...field} />
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Value</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="10000" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    <DialogClose asChild>
                      <Button variant="outline" onClick={() => form.reset()}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Creating...' : 'Create Contract'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search contracts..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-5 w-full sm:w-[600px]">
            <TabsTrigger value="all">
              All ({contractCounts.all})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Draft ({contractCounts.draft})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({contractCounts.active})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({contractCounts.completed})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({contractCounts.cancelled})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {isLoadingContracts || isLoadingCompanies ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContracts.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No contracts found. Add your first contract to get started.
            </div>
          ) : (
            filteredContracts.map(contract => (
              <Card key={contract.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <CardTitle className="text-lg">{contract.title}</CardTitle>
                      <div className="ml-2">{getStatusBadge(contract.status)}</div>
                    </div>
                    {canModify && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(contract)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          {contract.file_url && (
                            <DropdownMenuItem asChild>
                              <a 
                                href={contract.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Download className="mr-2 h-4 w-4" /> Download
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDelete(contract.id)}
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
                        {getCompanyName(contract.company_id)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Value:</span>
                      <span className="font-medium ml-1">
                        {formatCurrency(contract.value)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium ml-1">
                        {formatDate(contract.start_date)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium ml-1">
                        {formatDate(contract.end_date)}
                      </span>
                    </div>
                  </div>
                  
                  {!contract.file_url && canModify && (
                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="flex gap-1 items-center">
                        <Upload className="h-4 w-4" />
                        <span>Upload Document</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
      
      {/* Edit Contract Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contract</DialogTitle>
            <DialogDescription>
              Update the contract information.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Marketing Services Agreement" {...field} />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Value</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="10000" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setCurrentContract(null);
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
    </div>
  );
};

export default ContractsPage;
