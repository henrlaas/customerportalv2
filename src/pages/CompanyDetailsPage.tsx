
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Users, Layers, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building } from 'lucide-react';
import { CompanyContactsList } from '@/components/Companies/CompanyContactsList';
import { CompanyHierarchy } from '@/components/Companies/CompanyHierarchy';
import { companyService } from '@/services/companyService';
import { CompanyDetailHeader } from '@/components/Companies/CompanyDetailHeader';
import { CompanyInfoCards } from '@/components/Companies/CompanyInfoCards';
import { CompanyOverviewTab } from '@/components/Companies/CompanyOverviewTab';
import { EditCompanyDialog } from '@/components/Companies/EditCompanyDialog';
import { DeleteCompanyDialog } from '@/components/Companies/DeleteCompanyDialog';

const CompanyDetailsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch company details - use fetchCompanyById
  const { data: company, isLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyService.fetchCompanyById(companyId as string),
    enabled: !!companyId,
  });
  
  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: () => companyService.deleteCompany(companyId as string),
    onSuccess: () => {
      toast({
        title: 'Company deleted',
        description: 'The company has been deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      navigate('/companies');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete company: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Check if the company is a subsidiary and redirect to parent company if needed
  useEffect(() => {
    if (company && company.parent_id) {
      navigate(`/companies/${company.parent_id}`);
      toast({
        title: "Redirected to parent company",
        description: `${company.name} is a subsidiary of another company.`
      });
    }
  }, [company, navigate, toast]);
  
  // Handle company click (for hierarchy navigation)
  const handleCompanyClick = (company: any) => {
    // Only navigate to the company details page if it's a parent company
    if (!company.parent_id) {
      navigate(`/companies/${company.id}`);
    }
  };
  
  const handleDeleteConfirm = () => {
    deleteCompanyMutation.mutate();
  };
  
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
            Back to Companies
          </Button>
        </div>
      </div>
    );
  }

  // Don't render the full page if this is a subsidiary - the redirect will happen
  if (company.parent_id) {
    return (
      <div className="container mx-auto p-6 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <CompanyDetailHeader company={company} isLoading={isLoading} />
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      <CompanyInfoCards company={company} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center">
            <Users className="h-4 w-4 mr-2" /> Contacts
          </TabsTrigger>
          {company.is_partner && (
            <TabsTrigger value="hierarchy" className="flex items-center">
              <Layers className="h-4 w-4 mr-2" /> Hierarchy
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview">
          <CompanyOverviewTab company={company} />
        </TabsContent>
        
        <TabsContent value="contacts">
          <CompanyContactsList companyId={company.id} />
        </TabsContent>
        
        {company.is_partner && (
          <TabsContent value="hierarchy">
            <CompanyHierarchy 
              companyId={company.id}
              onSelectCompany={handleCompanyClick}
            />
          </TabsContent>
        )}
      </Tabs>

      <EditCompanyDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        companyId={company.id}
      />

      <DeleteCompanyDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        company={company}
        isDeleting={deleteCompanyMutation.isPending}
      />
    </div>
  );
};

export default CompanyDetailsPage;
