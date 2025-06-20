
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { Building, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MultiStageCompanyDialog } from '@/components/Companies/MultiStageCompanyDialog/MultiStageCompanyDialog';
import { CompanyFilters } from '@/components/Companies/CompanyFilters';
import { CompanyListView } from '@/components/Companies/CompanyListView';
import { Company } from '@/types/company';
import { Skeleton } from '@/components/ui/skeleton';
import { CenteredSpinner } from '@/components/ui/CenteredSpinner';
import { useCompanyList } from '@/hooks/useCompanyList';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const CompaniesPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState<string>('all');
  const [showSubsidiaries, setShowSubsidiaries] = useState(false);
  
  const { isAdmin, isEmployee } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
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

  // Handle company deletion success
  const handleCompanyDeleted = () => {
    // Invalidate queries to refresh the list
    queryClient.invalidateQueries({ queryKey: ['companyList'] });
    queryClient.invalidateQueries({ queryKey: ['companies'] });
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsCreating(false);
    // Invalidate queries to refresh the list when dialog closes
    queryClient.invalidateQueries({ queryKey: ['companyList'] });
    queryClient.invalidateQueries({ queryKey: ['companies'] });
  };
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Companies</h1>
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
          showSubsidiaries={showSubsidiaries}
          setShowSubsidiaries={setShowSubsidiaries}
        />
      </div>

      {/* Companies list */}
      <div className="w-full">
        {isLoading ? (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Advisor</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(5).fill(0).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-40 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-36" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
        ) : (
          <div className="w-full">
            <CompanyListView 
              companies={filteredCompanies} 
              onCompanyClick={handleCompanyClick}
              onCompanyDeleted={handleCompanyDeleted}
            />
          </div>
        )}
      </div>
      
      {/* Multi-Stage Company Creation Dialog */}
      <MultiStageCompanyDialog
        isOpen={isCreating}
        onClose={handleDialogClose}
      />
    </div>
  );
};

export default CompaniesPage;
