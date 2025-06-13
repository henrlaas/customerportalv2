
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Users, Layers, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building } from 'lucide-react';
import { CompanyContactsList } from '@/components/Companies/CompanyContactsList';
import { CompanyHierarchy } from '@/components/Companies/CompanyHierarchy';
import { companyService } from '@/services/companyService';
import { CompanyDetailHeader } from '@/components/Companies/CompanyDetailHeader';
import { CompanyOverviewTab } from '@/components/Companies/CompanyOverviewTab';
import { CompanyHeroCard } from '@/components/Companies/CompanyHeroCard';
import { CompanySummaryCards } from '@/components/Companies/CompanySummaryCards';

const CompanyDetailsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch company details - use fetchCompanyById
  const { data: company, isLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyService.fetchCompanyById(companyId as string),
    enabled: !!companyId,
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
      {/* Header with Back Button, Title, and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/companies')} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
          <h1 className="text-2xl font-bold">Company Details</h1>
        </div>
        
        {/* Action Button */}
        <CompanyDetailHeader company={company} isLoading={isLoading} />
      </div>

      {/* Hero Card */}
      <CompanyHeroCard company={company} />
      
      {/* Summary Cards */}
      <CompanySummaryCards company={company} />
      
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
    </div>
  );
};

export default CompanyDetailsPage;
