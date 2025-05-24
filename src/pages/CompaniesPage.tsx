
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { CompanyCardView } from '@/components/Companies/CompanyCardView';
import { CompanyListView } from '@/components/Companies/CompanyListView';
import { CompanyFilters } from '@/components/Companies/CompanyFilters';
import { MultiStageCompanyDialog } from '@/components/Companies/MultiStageCompanyDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Building2, Users, TrendingUp, LayoutGrid, List } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Company } from '@/types/company';

type ViewMode = 'grid' | 'list';

export default function CompaniesPage() {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState('all');
  const [showSubsidiaries, setShowSubsidiaries] = useState(false);
  const t = useTranslation();

  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: companyService.fetchCompanies,
  });

  const filteredCompanies = companies.filter((company: Company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClientTypes = clientTypeFilter === 'all' || 
      (clientTypeFilter === 'Marketing' && company.is_marketing_client) ||
      (clientTypeFilter === 'Web' && company.is_web_client);
    const matchesSubsidiaries = showSubsidiaries || !company.parent_id;
    
    return matchesSearch && matchesClientTypes && matchesSubsidiaries;
  });

  const totalCompanies = companies.length;
  const marketingClients = companies.filter((c: Company) => c.is_marketing_client).length;
  const webClients = companies.filter((c: Company) => c.is_web_client).length;
  const totalMrr = companies.reduce((sum: number, company: Company) => {
    return sum + (company.mrr || 0);
  }, 0);

  const handleCompanyClick = (company: Company) => {
    navigate(`/companies/${company.id}`);
  };

  if (isLoading) {
    return <div className="p-6">Loading companies...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error loading companies: {error.message}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('companies.title')}</h1>
          <p className="text-muted-foreground">{t('companies.subtitle')}</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-black hover:bg-black/90">
          <Plus className="mr-2 h-4 w-4" />
          {t('companies.newCompany')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('companies.totalCompanies')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('companies.marketingClients')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('companies.webClients')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('companies.totalMrr')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMrr.toLocaleString()} kr</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between">
        <CompanyFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          clientTypeFilter={clientTypeFilter}
          setClientTypeFilter={setClientTypeFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showSubsidiaries={showSubsidiaries}
          setShowSubsidiaries={setShowSubsidiaries}
        />
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Company Content */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">{t('companies.tabs.all')}</TabsTrigger>
          <TabsTrigger value="marketing">{t('companies.tabs.marketing')}</TabsTrigger>
          <TabsTrigger value="web">{t('companies.tabs.web')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {viewMode === 'grid' ? (
            <CompanyCardView companies={filteredCompanies} onCompanyClick={handleCompanyClick} />
          ) : (
            <CompanyListView companies={filteredCompanies} onCompanyClick={handleCompanyClick} />
          )}
        </TabsContent>
        
        <TabsContent value="marketing" className="space-y-4">
          {viewMode === 'grid' ? (
            <CompanyCardView companies={filteredCompanies.filter(c => c.is_marketing_client)} onCompanyClick={handleCompanyClick} />
          ) : (
            <CompanyListView companies={filteredCompanies.filter(c => c.is_marketing_client)} onCompanyClick={handleCompanyClick} />
          )}
        </TabsContent>
        
        <TabsContent value="web" className="space-y-4">
          {viewMode === 'grid' ? (
            <CompanyCardView companies={filteredCompanies.filter(c => c.is_web_client)} onCompanyClick={handleCompanyClick} />
          ) : (
            <CompanyListView companies={filteredCompanies.filter(c => c.is_web_client)} onCompanyClick={handleCompanyClick} />
          )}
        </TabsContent>
      </Tabs>

      <MultiStageCompanyDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
}
