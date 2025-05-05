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

  // Helper function to format address
  const getFormattedAddress = (company: Company) => {
    const addressParts = [];
    
    if (company.street_address) {
      addressParts.push(company.street_address);
    }
    
    if (company.city) {
      addressParts.push(company.city);
      if (company.postal_code) {
        addressParts[addressParts.length - 1] += `, ${company.postal_code}`;
      }
    }
    
    if (company.country) {
      addressParts.push(company.country);
    }
    
    return addressParts.length > 0 ? addressParts : null;
  };

  return (
    <div className={`relative ${depth > 0 ? 'pl-4 border-l-2 border-gray-100 ml-3 mt-1' : ''}`}>
      {/* Company Row - Always visible */}
      <div className="flex justify-between items-center py-2">
        {/* Company Name and Icon - Clickable */}
        <div 
          onClick={toggleExpand}
          className={`flex items-center gap-2 flex-grow cursor-pointer hover:bg-gray-50 rounded-md px-2 py-1`}
        >
          {isExpanded ? (
            <ChevronDown className={`${depth > 0 ? 'h-4 w-4' : 'h-5 w-5'} text-gray-500`} />
          ) : (
            <ChevronRight className={`${depth > 0 ? 'h-4 w-4' : 'h-5 w-5'} text-gray-500`} />
          )}
          <Building2 className={`${depth > 0 ? 'h-4 w-4' : 'h-5 w-5'} text-gray-500`} />
          <span className={`${depth > 0 ? 'text-sm font-medium' : 'text-base font-medium'}`}>
            {company.name}
          </span>
          
          {/* Brief Info Section when not expanded */}
          {!isExpanded && (
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground ml-2">
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
        
        {/* Actions Dropdown Menu */}
        <div className="flex items-center">
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
      </div>

      {/* Expanded Company Details */}
      {isExpanded && (
        <div className="mt-2 mb-4 ml-6 mr-2 bg-gray-50 rounded-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.organization_number && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Organization Number</h4>
                <div className="flex items-center">
                  <Hash className="h-4 w-4 mr-2 text-gray-500" />
                  <p>{company.organization_number}</p>
                </div>
              </div>
            )}
            
            {company.website && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Website</h4>
                <a 
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:underline"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {company.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            
            {company.phone && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <p>{company.phone}</p>
                </div>
              </div>
            )}
            
            {company.invoice_email && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Invoice Email</h4>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <p>{company.invoice_email}</p>
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Created</h4>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <p>{formatDate(company.created_at)}</p>
              </div>
            </div>
          </div>
          
          {/* Address Section */}
          {(company.street_address || company.city || company.postal_code || company.country) && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Address</h4>
              {company.street_address && (
                <p className="text-sm">{company.street_address}</p>
              )}
              {(company.city || company.postal_code || company.country) && (
                <p className="text-sm mt-1">
                  {company.city && company.city}
                  {company.postal_code && `, ${company.postal_code}`}
                  {company.country && `, ${company.country}`}
                </p>
              )}
            </div>
          )}
          
          {canModify && (
            <div className="flex justify-end gap-2 mt-4">
              {onEditCompany && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEditCompany()}
                >
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
              <Button 
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteCompany(company.id)}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
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
