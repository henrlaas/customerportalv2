
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { companyService } from '@/services/companyService';
import { Company } from '@/types/company';
import { Button } from '@/components/ui/button';
import { Building2, ChevronDown, ChevronRight, Edit, ExternalLink, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface CompanyHierarchyItemProps {
  company: Company;
  onSelectCompany: (company: Company) => void;
  onEditCompany?: () => void;
  depth?: number;
}

export const CompanyHierarchyItem = ({ 
  company, 
  onSelectCompany, 
  onEditCompany,
  depth = 0 
}: CompanyHierarchyItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
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
        description: 'The company has been deleted',
      });
      queryClient.invalidateQueries({ queryKey: ['childCompanies', company.parent_id] });
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

  // Hide expand/collapse button for subsidiaries since they can't have their own subsidiaries
  const canHaveChildren = depth === 0;
  
  const handleCompanyClick = () => {
    if (depth > 0) {
      // If this is a subsidiary, show details dialog
      setShowDetails(true);
    } else {
      // If this is a parent company, use the provided callback
      onSelectCompany(company);
    }
  };

  return (
    <>
      <div className={`border-b border-gray-100 last:border-b-0 pb-2 ${depth > 0 ? 'pl-5 border-l-2 border-gray-100 ml-3 mt-1' : ''}`}>
        <div className="flex justify-between items-center">
          <div 
            className="flex items-center space-x-2 py-1"
            onClick={handleCompanyClick}
            style={{ cursor: 'pointer' }}
          >
            <Building2 className={`${depth > 0 ? 'h-4 w-4' : 'h-5 w-5'} text-gray-500`} />
            <span className={`${depth > 0 ? 'text-sm font-medium' : 'text-base font-medium'}`}>{company.name}</span>
          </div>
          
          {canModify && (
            <div className="flex space-x-1">
              {onEditCompany && (
                <Button 
                  variant="ghost" 
                  size={depth > 0 ? "sm" : "default"} 
                  className={depth > 0 ? "h-7 w-7 p-0" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCompany();
                  }}
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
              >
                <Trash2 className={depth > 0 ? "h-3.5 w-3.5" : "h-4 w-4"} />
              </Button>
              {canHaveChildren && (
                <Button 
                  variant="ghost" 
                  size={depth > 0 ? "sm" : "default"}
                  className={depth > 0 ? "h-7 w-7 p-0" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className={depth > 0 ? "h-3.5 w-3.5" : "h-4 w-4"} />
                  ) : (
                    <ChevronRight className={depth > 0 ? "h-3.5 w-3.5" : "h-4 w-4"} />
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
        
        {isExpanded && canHaveChildren && (
          <CompanyHierarchyChildren 
            parentId={company.id}
            onSelectCompany={onSelectCompany}
            depth={depth + 1}
          />
        )}
      </div>

      {/* Subsidiary Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{company.name}</DialogTitle>
            <DialogDescription>Company details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Organization Number</p>
                <p className="text-sm">{company.organization_number || 'Not specified'}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Website</p>
                {company.website ? (
                  <p className="text-sm flex items-center gap-1">
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                      {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </p>
                ) : (
                  <p className="text-sm">Not specified</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
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
                  setShowDetails(false);
                  handleDeleteCompany(company.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Child component to handle fetching children
const CompanyHierarchyChildren = ({ 
  parentId, 
  onSelectCompany,
  depth = 1
}: { 
  parentId: string; 
  onSelectCompany: (company: Company) => void;
  depth?: number;
}) => {
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['childCompanies', parentId],
    queryFn: () => companyService.getChildCompanies(parentId),
  });
  
  if (isLoading) {
    return <div className="py-2">Loading...</div>;
  }
  
  if (companies.length === 0) {
    return <div className="py-2 text-sm text-gray-500">No subsidiaries</div>;
  }
  
  return (
    <div className="space-y-2 mt-2">
      {companies.map(company => (
        <CompanyHierarchyItem
          key={company.id}
          company={company}
          onSelectCompany={onSelectCompany}
          depth={depth}
        />
      ))}
    </div>
  );
};
