
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building, 
  Plus, 
  Search,
  Layers,
  Users,
  Briefcase,
  Filter,
  ArrowUpDown,
  Globe,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
} from 'lucide-react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanyContactsList } from '@/components/Companies/CompanyContactsList';
import { CompanyHierarchy } from '@/components/Companies/CompanyHierarchy';
import { EditCompanyDialog } from '@/components/Companies/EditCompanyDialog';
import { companyService } from '@/services/companyService';
import { Company } from '@/types/company';
import { MultiStageCompanyDialog } from '@/components/Companies/MultiStageCompanyDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CompaniesPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [clientTypeFilter, setClientTypeFilter] = useState<string>('all');
  
  const { toast } = useToast();
  const { isAdmin, isEmployee } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch companies
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companyService.getCompanies,
  });
  
  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: companyService.deleteCompany,
    onSuccess: () => {
      toast({
        title: 'Company deleted',
        description: 'The company has been deleted',
      });
      setSelectedCompany(null);
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting company',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Filter companies by search query and type
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.address && company.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company.city && company.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company.country && company.country.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = clientTypeFilter === 'all' || company.client_type === clientTypeFilter;
    
    return matchesSearch && matchesType;
  });
  
  // Check if user can modify companies (admin or employee)
  const canModify = isAdmin || isEmployee;
  
  // Handle company click
  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setActiveTab('overview');
  };
  
  // Handle delete confirmation
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this company? This will also delete all associated data.')) {
      deleteCompanyMutation.mutate(id);
    }
  };
  
  const getCompanyTypeColor = (type: string | null) => {
    switch (type) {
      case 'Marketing':
        return 'bg-blue-100 text-blue-800';
      case 'Web':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Companies</h1>
        {canModify && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        )}
      </div>
      
      {/* Search and filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-lg">
              Companies ({filteredCompanies.length})
            </CardTitle>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search companies..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={clientTypeFilter}
                onValueChange={setClientTypeFilter}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Client Type</SelectLabel>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Web">Web</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="flex rounded-md border">
                <Button
                  variant="ghost"
                  size="icon"
                  className={viewMode === 'list' ? 'bg-accent' : ''}
                  onClick={() => setViewMode('list')}
                >
                  <Briefcase className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={viewMode === 'card' ? 'bg-accent' : ''}
                  onClick={() => setViewMode('card')}
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center p-8 bg-muted/10 rounded-lg">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">No companies found</p>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              {canModify && (
                <Button variant="outline" onClick={() => setIsCreating(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Company
                </Button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Advisor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow 
                      key={company.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleCompanyClick(company)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            {company.logo_url ? (
                              <img 
                                src={company.logo_url}
                                alt={company.name}
                                className="h-8 w-8 object-cover"
                              />
                            ) : (
                              <Building className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{company.name}</div>
                            <div className="text-xs text-gray-500">
                              {company.organization_number || 'No org. number'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {company.client_type && (
                          <Badge variant="outline" className={getCompanyTypeColor(company.client_type)}>
                            {company.client_type}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {company.website ? (
                          <a 
                            href={company.website} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Globe className="h-3 w-3" />
                            {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </a>
                        ) : (
                          <span className="text-gray-500 text-sm">No website</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {company.advisor_id ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>Assigned</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <span className="sr-only">Open menu</span>
                                <ArrowUpDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedCompany(company);
                                  setIsEditing(true);
                                }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(company.id)}>
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedCompany(company);
                                  setActiveTab('contacts');
                                }}>
                                  <Users className="mr-2 h-4 w-4" />
                                  <span>View Contacts</span>
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map((company) => (
                <Card 
                  key={company.id} 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleCompanyClick(company)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {company.logo_url ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={company.logo_url} alt={company.name} />
                            <AvatarFallback>
                              <Building className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Building className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-base font-medium">{company.name}</CardTitle>
                          {company.client_type && (
                            <Badge variant="outline" className={`text-xs mt-1 ${getCompanyTypeColor(company.client_type)}`}>
                              {company.client_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {canModify && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ArrowUpDown className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCompany(company);
                              setIsEditing(true);
                            }}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(company.id);
                            }}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="space-y-2 text-sm text-gray-500">
                      {company.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5" />
                          <a 
                            href={company.website} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </a>
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{company.phone}</span>
                        </div>
                      )}
                      {company.invoice_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{company.invoice_email}</span>
                        </div>
                      )}
                      {company.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>
                            {company.city}
                            {company.country ? `, ${company.country}` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    {company.created_at && (
                      <div className="flex items-center mt-4 text-xs text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          Created: {new Date(company.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Company Details */}
      <div className="mt-6">
        {selectedCompany ? (
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                {selectedCompany.logo_url ? (
                  <img 
                    src={selectedCompany.logo_url} 
                    alt={`${selectedCompany.name} logo`} 
                    className="w-16 h-16 rounded-lg object-contain bg-white p-1 border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Building className="h-8 w-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{selectedCompany.name}</h2>
                    {selectedCompany.client_type && (
                      <Badge variant="outline" className={getCompanyTypeColor(selectedCompany.client_type)}>
                        {selectedCompany.client_type}
                      </Badge>
                    )}
                  </div>
                  {selectedCompany.street_address && (
                    <p className="text-gray-500">
                      {selectedCompany.street_address}, 
                      {selectedCompany.city && ` ${selectedCompany.city}`}
                      {selectedCompany.postal_code && ` ${selectedCompany.postal_code}`}
                      {selectedCompany.country && `, ${selectedCompany.country}`}
                    </p>
                  )}
                </div>
              </div>
              
              {canModify && (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDelete(selectedCompany.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {selectedCompany.website && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium text-gray-500">Website</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <a 
                      href={selectedCompany.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedCompany.website.replace(/^https?:\/\//, '')}
                    </a>
                  </CardContent>
                </Card>
              )}
              
              {selectedCompany.phone && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium text-gray-500">Phone</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <p>{selectedCompany.phone}</p>
                  </CardContent>
                </Card>
              )}
              
              {selectedCompany.invoice_email && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium text-gray-500">Invoice Email</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <p>{selectedCompany.invoice_email}</p>
                  </CardContent>
                </Card>
              )}
              
              {selectedCompany.client_type === 'Marketing' && selectedCompany.mrr !== null && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium text-gray-500">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <p>${selectedCompany.mrr}</p>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium text-gray-500">Created</CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <p>{new Date(selectedCompany.created_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="contacts" className="flex items-center">
                  <Users className="h-4 w-4 mr-2" /> Contacts
                </TabsTrigger>
                <TabsTrigger value="hierarchy" className="flex items-center">
                  <Layers className="h-4 w-4 mr-2" /> Hierarchy
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                {/* Overview content */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-500">No recent activity to display.</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Company Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-3 gap-1">
                          <div className="font-medium">Name:</div>
                          <div className="col-span-2">{selectedCompany.name}</div>
                        </div>
                        
                        {selectedCompany.organization_number && (
                          <div className="grid grid-cols-3 gap-1">
                            <div className="font-medium">Organization #:</div>
                            <div className="col-span-2">{selectedCompany.organization_number}</div>
                          </div>
                        )}
                        
                        {selectedCompany.website && (
                          <div className="grid grid-cols-3 gap-1">
                            <div className="font-medium">Website:</div>
                            <div className="col-span-2">
                              <a 
                                href={selectedCompany.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {selectedCompany.website}
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {selectedCompany.phone && (
                          <div className="grid grid-cols-3 gap-1">
                            <div className="font-medium">Phone:</div>
                            <div className="col-span-2">{selectedCompany.phone}</div>
                          </div>
                        )}
                        
                        {selectedCompany.invoice_email && (
                          <div className="grid grid-cols-3 gap-1">
                            <div className="font-medium">Invoice Email:</div>
                            <div className="col-span-2">{selectedCompany.invoice_email}</div>
                          </div>
                        )}
                        
                        {selectedCompany.street_address && (
                          <div className="grid grid-cols-3 gap-1">
                            <div className="font-medium">Address:</div>
                            <div className="col-span-2">
                              {selectedCompany.street_address}<br />
                              {selectedCompany.city && selectedCompany.city}
                              {selectedCompany.postal_code && ` ${selectedCompany.postal_code}`}<br />
                              {selectedCompany.country && selectedCompany.country}
                            </div>
                          </div>
                        )}
                        
                        {selectedCompany.client_type && (
                          <div className="grid grid-cols-3 gap-1">
                            <div className="font-medium">Client Type:</div>
                            <div className="col-span-2">{selectedCompany.client_type}</div>
                          </div>
                        )}
                        
                        {selectedCompany.client_type === 'Marketing' && selectedCompany.mrr !== null && (
                          <div className="grid grid-cols-3 gap-1">
                            <div className="font-medium">Monthly Revenue:</div>
                            <div className="col-span-2">${selectedCompany.mrr}</div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-3 gap-1">
                          <div className="font-medium">Trial Period:</div>
                          <div className="col-span-2">{selectedCompany.trial_period ? 'Yes' : 'No'}</div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-1">
                          <div className="font-medium">Partner:</div>
                          <div className="col-span-2">{selectedCompany.is_partner ? 'Yes' : 'No'}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contacts">
                {/* Contacts tab content */}
                <CompanyContactsList companyId={selectedCompany.id} />
              </TabsContent>
              
              <TabsContent value="hierarchy">
                {/* Hierarchy tab content */}
                <CompanyHierarchy 
                  companyId={selectedCompany.id}
                  onSelectCompany={handleCompanyClick}
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] border rounded-lg bg-muted/10">
            <Building className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No Company Selected</h3>
            <p className="text-gray-500 text-center max-w-md">
              Select a company from the list to view details or create a new one.
            </p>
            {canModify && (
              <Button variant="outline" className="mt-6" onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Company
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Multi-Stage Company Creation Dialog */}
      <MultiStageCompanyDialog
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
      />
      
      {/* Edit Company Dialog */}
      {selectedCompany && (
        <EditCompanyDialog
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          companyId={selectedCompany.id}
        />
      )}
    </div>
  );
};

export default CompaniesPage;

import { Edit, Trash } from 'lucide-react';
