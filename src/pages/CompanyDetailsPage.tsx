
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
import { MultiStageCompanyDialog } from '@/components/Companies/MultiStageCompanyDialog/MultiStageCompanyDialog';
import { DeleteCompanyDialog } from '@/components/Companies/DeleteCompanyDialog';
import { useAuth } from '@/contexts/AuthContext';

const CompanyDetailsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin, isEmployee } = useAuth();
  
  // Check if user can modify companies (admin or employee)
  const canModify = isAdmin || isEmployee;
  
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
        title: 'Success',
        description: 'Company deleted successfully',
      });
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

  // Handle edit dialog close
  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    // Refresh company data after edit
    queryClient.invalidateQueries({ queryKey: ['company', companyId] });
  };

  // Handle delete confirmation
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
        
        {canModify && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Company
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
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

      {/* Edit Company Dialog */}
      <MultiStageCompanyDialog
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        defaultValues={{
          name: company.name,
          organization_number: company.organization_number || '',
          client_types: [
            ...(company.is_marketing_client ? ['Marketing'] : []),
            ...(company.is_web_client ? ['Web'] : [])
          ],
          website: company.website || '',
          phone: company.phone || '',
          invoice_email: company.invoice_email || '',
          street_address: company.street_address || '',
          city: company.city || '',
          postal_code: company.postal_code || '',
          country: company.country || '',
          trial_period: company.trial_period || false,
          is_partner: company.is_partner || false,
          advisor_id: company.advisor_id || '',
          mrr: company.mrr || 0,
        }}
      />

      {/* Delete Company Dialog */}
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
