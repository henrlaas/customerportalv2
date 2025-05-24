
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { 
  Building,
  Globe,
  CheckCircle,
  Trash,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Company } from '@/types/company';
import { companyService } from '@/services/companyService';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { DeleteCompanyDialog } from './DeleteCompanyDialog';

interface CompanyListViewProps {
  companies: Company[];
  onCompanyClick: (company: Company) => void;
}

export const CompanyListView = ({ companies, onCompanyClick }: CompanyListViewProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin, isEmployee } = useAuth();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(companies.length / itemsPerPage);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  
  // Get companies for current page
  const paginatedCompanies = companies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const canModify = isAdmin || isEmployee;
  
  // Fetch users to get advisor information
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: userService.listUsers,
    // Only fetch if we have companies with advisors assigned
    enabled: companies.some(company => company.advisor_id)
  });
  
  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: companyService.deleteCompany,
    onSuccess: () => {
      toast({
        title: 'Company deleted',
        description: 'The company has been successfully deleted',
      });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting company',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (companyToDelete) {
      deleteCompanyMutation.mutate(companyToDelete.id);
    }
  };
  
  // Helper function to get advisor details
  const getAdvisorDetails = (advisorId: string | null) => {
    if (!advisorId) return null;
    
    const advisor = users.find(user => user.id === advisorId);
    if (!advisor) return null;
    
    return {
      name: `${advisor.user_metadata?.first_name || ''} ${advisor.user_metadata?.last_name || ''}`.trim() || advisor.email,
      email: advisor.email,
      avatar_url: advisor.user_metadata?.avatar_url || null,
      // Use initials for avatar fallback
      initials: getInitials(advisor.user_metadata?.first_name, advisor.user_metadata?.last_name)
    };
  };
  
  // Helper function to get initials from name
  const getInitials = (firstName?: string, lastName?: string): string => {
    let initials = '';
    if (firstName) initials += firstName.charAt(0).toUpperCase();
    if (lastName) initials += lastName.charAt(0).toUpperCase();
    return initials || '??';
  };
  
  // Function to handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll back to top when changing pages
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  
  // Calculate page numbers to display
  const getPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are less than or equal to maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        // Add ellipsis if currentPage is far from the start
        pages.push(-1); // -1 indicates ellipsis
      }
      
      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        // Add ellipsis if currentPage is far from the end
        pages.push(-2); // -2 indicates ellipsis (using different value to have unique key)
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const isLoading = isLoadingUsers;
  
  return (
    <div className="space-y-4">
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
            {isLoading ? (
              // Render loading skeleton for table rows
              Array(5).fill(0).map((_, index) => (
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
              ))
            ) : (
              paginatedCompanies.map((company) => {
                const advisorDetails = getAdvisorDetails(company.advisor_id);
                
                return (
                  <TableRow 
                    key={company.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onCompanyClick(company)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                          {company.logo_url ? (
                            <img 
                              src={company.logo_url}
                              alt={company.name}
                              className="h-8 w-8 object-cover"
                            />
                          ) : (
                            <Building className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-xs text-gray-500">
                            {company.organization_number || 'No org. number'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {company.is_marketing_client && (
                          <Badge variant="marketing">
                            Marketing
                          </Badge>
                        )}
                        {company.is_web_client && (
                          <Badge variant="web">
                            Web
                          </Badge>
                        )}
                        {!company.is_marketing_client && !company.is_web_client && (
                          <span className="text-gray-500 text-sm">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {company.website ? (
                        <a 
                          href={company.website} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="h-3 w-3" />
                          {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">No website</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {company.is_partner ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span>Partner</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {advisorDetails ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage 
                              src={advisorDetails.avatar_url} 
                              alt={advisorDetails.name} 
                            />
                            <AvatarFallback className="text-xs">
                              {advisorDetails.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{advisorDetails.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                        {canModify && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteClick(company)}
                            className="text-gray-500 hover:text-red-600"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }} 
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {getPagination().map((page, index) => (
              <PaginationItem key={`page-${page}-${index}`}>
                {page < 0 ? (
                  <span className="flex h-9 w-9 items-center justify-center">...</span>
                ) : (
                  <PaginationLink 
                    href="#" 
                    isActive={page === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteCompanyDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCompanyToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        company={companyToDelete}
        isDeleting={deleteCompanyMutation.isPending}
      />
    </div>
  );
};
