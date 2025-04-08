
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Users, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building } from 'lucide-react';
import { CompanyContactsList } from '@/components/Companies/CompanyContactsList';
import { CompanyHierarchy } from '@/components/Companies/CompanyHierarchy';
import { companyService } from '@/services/companyService';
import { CompanyDetailHeader } from '@/components/Companies/CompanyDetailHeader';
import { CompanyInfoCards } from '@/components/Companies/CompanyInfoCards';
import { CompanyOverviewTab } from '@/components/Companies/CompanyOverviewTab';

const CompanyDetailsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch company details
  const { data: company, isLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyService.getCompany(companyId as string),
    enabled: !!companyId,
  });
  
  // Handle company click (for hierarchy navigation)
  const handleCompanyClick = (company: any) => {
    navigate(`/companies/${company.id}`);
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

  return (
    <div className="container mx-auto p-6">
      <CompanyDetailHeader company={company} isLoading={isLoading} />
      
      <CompanyInfoCards company={company} />
      
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
          <CompanyOverviewTab company={company} />
        </TabsContent>
        
        <TabsContent value="contacts">
          <CompanyContactsList companyId={company.id} />
        </TabsContent>
        
        <TabsContent value="hierarchy">
          <CompanyHierarchy 
            companyId={company.id}
            onSelectCompany={handleCompanyClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyDetailsPage;
