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
  Trash2, 
  Phone,
  Mail,
  Calendar,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  MoreVertical,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CompanyFavicon } from '@/components/CompanyFavicon';

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
  const [isExpanded, setIsExpanded] = useState(false);
  
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
      setIsExpanded(false);
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

  // Format the date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Toggle expanded state when company name is clicked
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="relative hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <CompanyFavicon 
              companyName={company.name}
              website={company.website}
              logoUrl={company.logo_url}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                {company.name}
              </CardTitle>
            </div>
          </div>
          
          {canModify && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-50 bg-white">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleExpand}>
                  {isExpanded ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      <span>Hide Details</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      <span>Show Details</span>
                    </>
                  )}
                </DropdownMenuItem>
                {onEditCompany && (
                  <DropdownMenuItem onClick={() => onEditCompany()}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600" 
                  onClick={() => handleDeleteCompany(company.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {company.organization_number && (
            <div className="flex items-center gap-2 text-gray-600">
              <span>Org.nr: {company.organization_number}</span>
            </div>
          )}
          
          {company.website && (
            <div className="flex items-center gap-2 text-gray-600">
              <Globe className="h-4 w-4 text-gray-400" />
              <a 
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {company.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{formatDate(company.created_at)}</span>
          </div>
        </div>

        {company.address && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              <div className="font-medium text-gray-700 mb-1">Address</div>
              <div>{company.address}</div>
              {company.city && (
                <div className="mt-1">
                  {company.city}
                  {company.postal_code && `, ${company.postal_code}`}
                  {company.country && `, ${company.country}`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <div className="text-sm">
              <div className="font-medium text-gray-700 mb-2">Additional Details</div>
              <div className="grid grid-cols-1 gap-2 text-gray-600">
                {company.client_type && (
                  <div>
                    <span className="font-medium">Client Type:</span> {company.client_type}
                  </div>
                )}
                {company.is_partner && (
                  <div>
                    <span className="font-medium">Status:</span> Partner Company
                  </div>
                )}
                {company.mrr && (
                  <div>
                    <span className="font-medium">MRR:</span> {company.mrr.toLocaleString()} NOK
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
    queryFn: () => companyService.fetchChildCompanies(parentId),
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
