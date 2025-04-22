import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Building, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MultiStageCompanyDialog } from '@/components/Companies/MultiStageCompanyDialog';
import { companyService } from '@/services/companyService';
import { CompanyFilters } from '@/components/Companies/CompanyFilters';
import { CompanyListView } from '@/components/Companies/CompanyListView';
import { CompanyCardView } from '@/components/Companies/CompanyCardView';
import { Company } from '@/types/company';
import { Skeleton } from '@/components/ui/skeleton';

const CompaniesPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [clientTypeFilter, setClientTypeFilter] = useState<string>('all');
  const [showSubsidiaries, setShowSubsidiaries] = useState(false);
  
  const { isAdmin, isEmployee } = useAuth();
  const navigate = useNavigate();
  
  // Fetch companies - use fetchCompanies
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companyService.fetchCompanies,
  });
  
  // Filter companies by search query, type, and parent status
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
    
    // Filter subsidiaries (companies with parent_id)
    const matchesParentStatus = showSubsidiaries || company.parent_id === null;
    
    return matchesSearch && matchesType && matchesParentStatus;
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
    <div className="w-full max-w-full px-4 sm:px-6 py-6 overflow-x-hidden">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Companies</h1>
        {canModify && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        )}
      </div>
      
      {/* Search and filters */}
      <Card className="mb-6 w-full">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-lg">
              Companies ({filteredCompanies.length})
            </CardTitle>
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
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>
              {/* List skeletons for list view, card skeletons for card view */}
              {viewMode === 'list' ? (
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-8 w-1/6" />
                  </div>
                  {Array.from({ length: 6 }).map((_, rowIdx) => (
                    <div key={rowIdx} className="flex gap-2">
                      <Skeleton className="h-8 w-1/3" />
                      <Skeleton className="h-8 w-1/4" />
                      <Skeleton className="h-8 w-1/6" />
                      <Skeleton className="h-8 w-1/6" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <Skeleton className="h-40 w-full rounded-xl" key={idx} />
                  ))}
                </div>
              )}
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
            <div className="overflow-x-auto w-full">
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
        </CardContent>
      </Card>
      
      {/* Multi-Stage Company Creation Dialog */}
      <MultiStageCompanyDialog
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
      />
    </div>
  );
};

export default CompaniesPage;
