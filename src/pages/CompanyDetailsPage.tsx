
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building, 
  ArrowLeft,
  Users,
  Layers,
  Calendar,
  Globe,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash,
} from 'lucide-react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CompanyContactsList } from '@/components/Companies/CompanyContactsList';
import { CompanyHierarchy } from '@/components/Companies/CompanyHierarchy';
import { EditCompanyDialog } from '@/components/Companies/EditCompanyDialog';
import { companyService } from '@/services/companyService';
import { Company } from '@/types/company';

const CompanyDetailsPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isEmployee } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch company details
  const { data: company, isLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyService.getCompany(companyId as string),
    enabled: !!companyId,
  });
  
  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: companyService.deleteCompany,
    onSuccess: () => {
      toast({
        title: 'Company deleted',
        description: 'The company has been deleted',
      });
      navigate('/companies');
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
  
  // Handle company click (for hierarchy navigation)
  const handleCompanyClick = (company: Company) => {
    navigate(`/companies/${company.id}`);
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
  
  // Check if user can modify companies (admin or employee)
  const canModify = isAdmin || isEmployee;
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!company) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center p-8 bg-muted/10 rounded-lg">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600 mb-2">Company not found</p>
          <Button variant="outline" onClick={() => navigate('/companies')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Companies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/companies')} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Company Details</h1>
      </div>
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          {company.logo_url ? (
            <img 
              src={company.logo_url} 
              alt={`${company.name} logo`} 
              className="w-16 h-16 rounded-lg object-contain bg-white p-1 border"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
              <Building className="h-8 w-8 text-gray-500" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{company.name}</h2>
              {company.client_type && (
                <Badge variant="outline" className={getCompanyTypeColor(company.client_type)}>
                  {company.client_type}
                </Badge>
              )}
              {company.is_partner && (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Partner
                </Badge>
              )}
            </div>
            {company.street_address && (
              <p className="text-gray-500">
                {company.street_address}, 
                {company.city && ` ${company.city}`}
                {company.postal_code && ` ${company.postal_code}`}
                {company.country && `, ${company.country}`}
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
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDelete(company.id)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {company.website && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-gray-500">Website</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                <Globe className="h-4 w-4 mr-2" />
                {company.website.replace(/^https?:\/\//, '')}
              </a>
            </CardContent>
          </Card>
        )}
        
        {company.phone && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-gray-500">Phone</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <p>{company.phone}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {company.invoice_email && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-gray-500">Invoice Email</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <p>{company.invoice_email}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {company.client_type === 'Marketing' && company.mrr !== null && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-gray-500">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent className="py-0">
              <p>${company.mrr}</p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-gray-500">Created</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <p>{new Date(company.created_at).toLocaleDateString()}</p>
            </div>
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
                    <div className="col-span-2">{company.name}</div>
                  </div>
                  
                  {company.organization_number && (
                    <div className="grid grid-cols-3 gap-1">
                      <div className="font-medium">Organization #:</div>
                      <div className="col-span-2">{company.organization_number}</div>
                    </div>
                  )}
                  
                  {company.website && (
                    <div className="grid grid-cols-3 gap-1">
                      <div className="font-medium">Website:</div>
                      <div className="col-span-2">
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {company.phone && (
                    <div className="grid grid-cols-3 gap-1">
                      <div className="font-medium">Phone:</div>
                      <div className="col-span-2">{company.phone}</div>
                    </div>
                  )}
                  
                  {company.invoice_email && (
                    <div className="grid grid-cols-3 gap-1">
                      <div className="font-medium">Invoice Email:</div>
                      <div className="col-span-2">{company.invoice_email}</div>
                    </div>
                  )}
                  
                  {company.street_address && (
                    <div className="grid grid-cols-3 gap-1">
                      <div className="font-medium">Address:</div>
                      <div className="col-span-2">
                        {company.street_address}<br />
                        {company.city && company.city}
                        {company.postal_code && ` ${company.postal_code}`}<br />
                        {company.country && company.country}
                      </div>
                    </div>
                  )}
                  
                  {company.client_type && (
                    <div className="grid grid-cols-3 gap-1">
                      <div className="font-medium">Client Type:</div>
                      <div className="col-span-2">{company.client_type}</div>
                    </div>
                  )}
                  
                  {company.client_type === 'Marketing' && company.mrr !== null && (
                    <div className="grid grid-cols-3 gap-1">
                      <div className="font-medium">Monthly Revenue:</div>
                      <div className="col-span-2">${company.mrr}</div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-medium">Trial Period:</div>
                    <div className="col-span-2">{company.trial_period ? 'Yes' : 'No'}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1">
                    <div className="font-medium">Partner:</div>
                    <div className="col-span-2">{company.is_partner ? 'Yes' : 'No'}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="contacts">
          {/* Contacts tab content */}
          <CompanyContactsList companyId={company.id} />
        </TabsContent>
        
        <TabsContent value="hierarchy">
          {/* Hierarchy tab content */}
          <CompanyHierarchy 
            companyId={company.id}
            onSelectCompany={handleCompanyClick}
          />
        </TabsContent>
      </Tabs>
      
      {/* Edit Company Dialog */}
      <EditCompanyDialog
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        companyId={company.id}
      />
    </div>
  );
};

export default CompanyDetailsPage;
