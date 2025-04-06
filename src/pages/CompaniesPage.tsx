import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building, 
  Plus, 
  Search,
  Globe,
  Phone,
  MapPin,
  MoreVertical,
  Trash2,
  Edit,
  Briefcase,
  Users
} from 'lucide-react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Company form schema
const companySchema = z.object({
  name: z.string().min(1, { message: 'Company name is required' }),
  website: z.string().url().or(z.literal('')).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo_url: z.string().url().or(z.literal('')).optional(),
});

// Company type matching our database schema
type Company = {
  id: string;
  name: string;
  website: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
};

const CompaniesPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { toast } = useToast();
  const { isAdmin, isEmployee } = useAuth();
  const queryClient = useQueryClient();
  
  // Form for creating/editing companies
  const form = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      website: '',
      phone: '',
      address: '',
      logo_url: '',
    },
  });
  
  // Fetch companies
  const { data: companies = [], isLoading } = useQuery({
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
  
  // Create company mutation
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof companySchema>) => {
      const { data, error } = await supabase
        .from('companies')
        .insert([values])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Company created',
        description: 'The company has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsCreating(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error creating company',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update company mutation
  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof companySchema> & { id: string }) => {
      const { id, ...companyData } = values;
      const { data, error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Company updated',
        description: 'The company has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsEditing(false);
      setCurrentCompany(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error updating company',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete company mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Company deleted',
        description: 'The company has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setCurrentCompany(null);
    },
    onError: (error) => {
      toast({
        title: 'Error deleting company',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Submit handler for the form
  const onSubmit = (values: z.infer<typeof companySchema>) => {
    if (isEditing && currentCompany) {
      updateMutation.mutate({ ...values, id: currentCompany.id });
    } else {
      createMutation.mutate(values);
    }
  };
  
  // Edit company
  const handleEdit = (company: Company) => {
    form.reset({
      name: company.name,
      website: company.website || '',
      phone: company.phone || '',
      address: company.address || '',
      logo_url: company.logo_url || '',
    });
    setCurrentCompany(company);
    setIsEditing(true);
  };
  
  // Delete company
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };
  
  // Filter companies by search query
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.address && company.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Check if user can modify companies (admin or employee)
  const canModify = isAdmin || isEmployee;
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Companies</h1>
        {canModify && (
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Company</DialogTitle>
                <DialogDescription>
                  Add a new company to your database.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Corporation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, City, Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="logo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} />
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
                      {createMutation.isPending ? 'Creating...' : 'Create Company'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search companies..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.length === 0 ? (
            <div className="col-span-full text-center p-8 text-gray-500">
              No companies found. Add your first company to get started.
            </div>
          ) : (
            filteredCompanies.map(company => (
              <Card key={company.id} className="overflow-hidden">
                {canModify && (
                  <div className="absolute right-2 top-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(company)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(company.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    {company.logo_url ? (
                      <img 
                        src={company.logo_url} 
                        alt={`${company.name} logo`} 
                        className="w-10 h-10 rounded object-contain mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center mr-3">
                        <Building className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2 text-sm">
                    {company.website && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-gray-400" />
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{company.phone}</span>
                      </div>
                    )}
                    {company.address && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">{company.address}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex gap-1 items-center">
                    <Briefcase className="h-4 w-4" />
                    <span>View Deals</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex gap-1 items-center">
                    <Users className="h-4 w-4" />
                    <span>Contacts</span>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
      
      {/* Edit Company Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update the company information.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setCurrentCompany(null);
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

export default CompaniesPage;
