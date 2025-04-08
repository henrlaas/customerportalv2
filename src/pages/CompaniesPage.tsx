
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building, 
  Plus, 
  Search,
  Layers,
  Users
} from 'lucide-react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanyContactsList } from '@/components/Companies/CompanyContactsList';
import { CompanyHierarchy } from '@/components/Companies/CompanyHierarchy';
import { CreateCompanyDialog } from '@/components/Companies/CreateCompanyDialog';
import { EditCompanyDialog } from '@/components/Companies/EditCompanyDialog';
import { companyService } from '@/services/companyService';
import { Company } from '@/types/company';

const CompaniesPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
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
  
  // Filter companies by search query
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.address && company.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
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
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Companies List Sidebar */}
        <div className="md:col-span-1">
          <div className="mb-4">
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
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/10">
              <p>No companies found.</p>
              {canModify && (
                <Button variant="outline" className="mt-4" onClick={() => setIsCreating(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Company
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
              {filteredCompanies.map(company => (
                <Card 
                  key={company.id} 
                  className={`cursor-pointer hover:bg-accent/50 transition-colors ${
                    selectedCompany?.id === company.id ? 'border-primary bg-accent/50' : ''
                  }`}
                  onClick={() => handleCompanyClick(company)}
                >
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      {company.logo_url ? (
                        <img 
                          src={company.logo_url} 
                          alt={`${company.name} logo`} 
                          className="w-8 h-8 rounded-full object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <Building className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                      <CardTitle className="text-sm font-medium">{company.name}</CardTitle>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Company Details */}
        <div className="md:col-span-3">
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
                    <h2 className="text-2xl font-bold">{selectedCompany.name}</h2>
                    {selectedCompany.address && (
                      <p className="text-gray-500">{selectedCompany.address}</p>
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
                          
                          {selectedCompany.address && (
                            <div className="grid grid-cols-3 gap-1">
                              <div className="font-medium">Address:</div>
                              <div className="col-span-2">{selectedCompany.address}</div>
                            </div>
                          )}
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
      </div>
      
      {/* Create Company Dialog */}
      <CreateCompanyDialog
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
