
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { companyService } from '@/services/companyService';
import { Company } from '@/types/company';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Edit, 
  ExternalLink, 
  Globe, 
  Hash,
  Trash2 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface CompanyHierarchyItemProps {
  company: Company;
  onSelectCompany: (company: Company) => void;
  onEditCompany?: () => void;
  depth?: number;
  activeSubsidiaryId?: string | null;
  setActiveSubsidiaryId?: (id: string | null) => void;
}

export const CompanyHierarchyItem = ({ 
  company, 
  onSelectCompany, 
  onEditCompany,
  depth = 0,
  activeSubsidiaryId,
  setActiveSubsidiaryId
}: CompanyHierarchyItemProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const { isAdmin, isEmployee } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const canModify = isAdmin || isEmployee;
  
  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: companyService.deleteCompany,
    onSuccess: () => {
      toast({
        title: 'Company deleted',
        description: 'The company has been deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['childCompanies', company.parent_id] });
      setShowDetails(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete company: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const handleDeleteCompany = (id: string) => {
    if (confirm('Are you sure you want to delete this company? This will also delete all associated data.')) {
      deleteCompanyMutation.mutate(id);
    }
  };

  // Determine if this company can have children
  const canHaveChildren = depth === 0;
  
  // Handle toggle for subsidiary details
  const handleToggleSubsidiary = () => {
    if (depth > 0 && setActiveSubsidiaryId) {
      if (activeSubsidiaryId === company.id) {
        setActiveSubsidiaryId(null);
      } else {
        setActiveSubsidiaryId(company.id);
      }
    }
  };
  
  // Check if this subsidiary is active
  const isActive = depth > 0 && activeSubsidiaryId === company.id;
  
  return (
    <>
      <div className={`relative ${depth > 0 ? 'pl-4 border-l-2 border-gray-100 ml-3 mt-1' : ''}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 flex-grow">
            {/* Company Name and Icon */}
            <div 
              className={`flex items-center gap-2 py-1 flex-grow cursor-pointer ${isActive ? 'text-primary font-medium' : ''}`}
              onClick={() => depth === 0 ? onSelectCompany(company) : handleToggleSubsidiary()}
            >
              <Building2 className={`${depth > 0 ? 'h-4 w-4' : 'h-5 w-5'} ${isActive ? 'text-primary' : 'text-gray-500'}`} />
              <span className={`${depth > 0 ? 'text-sm font-medium' : 'text-base font-medium'}`}>
                {company.name}
              </span>
            </div>
            
            {/* Brief Info Section for Subsidiaries when not expanded */}
            {depth > 0 && !isActive && (
              <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                {company.organization_number && (
                  <div className="flex items-center gap-1">
                    <Hash className="h-3.5 w-3.5" />
                    <span>{company.organization_number}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" />
                    <a 
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-500 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Actions */}
          {canModify && (
            <div className="flex gap-1">
              {onEditCompany && (
                <Button 
                  variant="ghost" 
                  size={depth > 0 ? "sm" : "default"} 
                  className={depth > 0 ? "h-7 w-7 p-0" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCompany();
                  }}
                  aria-label="Edit company"
                >
                  <Edit className={depth > 0 ? "h-3.5 w-3.5" : "h-4 w-4"} />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size={depth > 0 ? "sm" : "default"}
                className={depth > 0 ? "h-7 w-7 p-0" : ""}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCompany(company.id);
                }}
                aria-label="Delete company"
              >
                <Trash2 className={depth > 0 ? "h-3.5 w-3.5" : "h-4 w-4"} />
              </Button>
              {depth > 0 && !isActive && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="ml-2 hidden sm:flex"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(true);
                  }}
                  aria-label="View details"
                >
                  View Details
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Expanded Subsidiary Information */}
        {isActive && (
          <div className="mt-2 mb-4 pl-6 pr-2 py-3 bg-muted/20 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Organization Number</h4>
                <p className="text-sm">{company.organization_number || 'Not specified'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Website</h4>
                {company.website ? (
                  <a 
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {company.website}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                ) : (
                  <p className="text-sm">Not specified</p>
                )}
              </div>
            </div>
            
            {canModify && (
              <div className="flex justify-end gap-2 mt-3">
                {onEditCompany && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCompany();
                    }}
                  >
                    <Edit className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </Button>
                )}
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCompany(company.id);
                  }}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Company Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {company.name}
            </DialogTitle>
            <DialogDescription>Company details</DialogDescription>
          </DialogHeader>
          
          <div className="mt-2">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Organization Number</TableCell>
                  <TableCell>{company.organization_number || 'Not specified'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Website</TableCell>
                  <TableCell>
                    {company.website ? (
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        {company.website}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    ) : (
                      'Not specified'
                    )}
                  </TableCell>
                </TableRow>
                {company.phone && (
                  <TableRow>
                    <TableCell className="font-medium">Phone</TableCell>
                    <TableCell>{company.phone}</TableCell>
                  </TableRow>
                )}
                {company.address && (
                  <TableRow>
                    <TableCell className="font-medium">Address</TableCell>
                    <TableCell>{company.address}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {canModify && (
            <div className="flex justify-end gap-2 mt-4">
              {onEditCompany && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDetails(false);
                    onEditCompany();
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              <Button 
                variant="destructive" 
                onClick={() => {
                  handleDeleteCompany(company.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// Child component to handle fetching children
const CompanyHierarchyChildren = ({ 
  parentId, 
  onSelectCompany,
  depth = 1,
  activeSubsidiaryId,
  setActiveSubsidiaryId
}: { 
  parentId: string; 
  onSelectCompany: (company: Company) => void;
  depth?: number;
  activeSubsidiaryId?: string | null;
  setActiveSubsidiaryId?: (id: string | null) => void;
}) => {
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['childCompanies', parentId],
    queryFn: () => companyService.getChildCompanies(parentId),
  });
  
  if (isLoading) {
    return <div className="py-2 pl-4">Loading...</div>;
  }
  
  if (companies.length === 0) {
    return <div className="py-2 pl-4 text-sm text-gray-500">No subsidiaries</div>;
  }
  
  return (
    <div className="space-y-2 mt-2 pl-2">
      {companies.map(company => (
        <CompanyHierarchyItem
          key={company.id}
          company={company}
          onSelectCompany={onSelectCompany}
          depth={depth}
          activeSubsidiaryId={activeSubsidiaryId}
          setActiveSubsidiaryId={setActiveSubsidiaryId}
        />
      ))}
    </div>
  );
};

