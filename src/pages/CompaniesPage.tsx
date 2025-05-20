import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Building, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MultiStageCompanyDialog } from '@/components/Companies/MultiStageCompanyDialog';
import { CompanyFilters } from '@/components/Companies/CompanyFilters';
import { CompanyListView } from '@/components/Companies/CompanyListView';
import { CompanyCardView } from '@/components/Companies/CompanyCardView';
import { Company } from '@/types/company';
import { Skeleton } from '@/components/ui/skeleton';
import { CenteredSpinner } from '@/components/ui/CenteredSpinner';
import { useCompanyList } from '@/hooks/useCompanyList';

const CompaniesPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [clientTypeFilter, setClientTypeFilter] = useState<string>('all');
  const [showSubsidiaries, setShowSubsidiaries] = useState(false);
  
  const { isAdmin, isEmployee } = useAuth();
  const navigate = useNavigate();
  
  // Use the proper hook for fetching companies with subsidiary filtering
  const { companies, isLoading } = useCompanyList(showSubsidiaries);
  
  // Filter companies by search query and type
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.address && company.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company.city && company.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company.country && company.country.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Handle client type filtering using the boolean fields directly
    const matchesType = 
      clientTypeFilter === 'all' || 
      (clientTypeFilter === 'Marketing' && company.is_marketing_client) ||
      (clientTypeFilter === 'Web' && company.is_web_client);
    
    return matchesSearch && matchesType;
  });
  
  // Check if user can modify companies (admin or employee)
  const canModify = isAdmin || isEmployee;
  
  // Handle company click - navigate to details page or parent company if it's a subsidiary
  const handleCompanyClick = async (company: Company) => {
    if (company.parent_id) {
      // If it's a subsidiary, navigate to the parent company
      navigate(`/companies/${company.parent_id}`);
    } else {
      // Otherwise navigate to the company details
      navigate(`/companies/${company.id}`);
    }
  };
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Companies</h1>
        {canModify && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        )}
      </div>
      
      {/* Search and filters */}
      <div className="bg-background p-4 rounded-lg">
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
      </div>

      {/* Companies list */}
      <div className="w-full">
        {isLoading ? (
          <CenteredSpinner />
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
          <div className="w-full">
            <CompanyListView 
              companies={filteredCompanies} 
              onCompanyClick={handleCompanyClick} 
            />
          </div>
        ) : (
          <CompanyCardView 
            companies={filteredCompanies} 
            onCompanyClick={handleCompanyClick} 
          />
        )}
      </div>
      
      {/* Multi-Stage Company Creation Dialog */}
      <MultiStageCompanyDialog
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
      />
    </div>
  );
};

export default CompaniesPage;
