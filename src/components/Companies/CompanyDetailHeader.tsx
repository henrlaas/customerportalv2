
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building, 
  ArrowLeft,
  Edit,
  Trash,
  BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditCompanyDialog } from '@/components/Companies/EditCompanyDialog';
import { DeleteCompanyDialog } from '@/components/Companies/DeleteCompanyDialog';
import { companyService } from '@/services/companyService';
import { Company } from '@/types/company';

interface CompanyDetailHeaderProps {
  company: Company;
  isLoading: boolean;
}

export const CompanyDetailHeader = ({ company, isLoading }: CompanyDetailHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isEmployee } = useAuth();
  const queryClient = useQueryClient();
  
  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: companyService.deleteCompany,
    onSuccess: () => {
      toast({
        title: 'Company deleted',
        description: 'The company has been deleted',
      });
      navigate('/companies');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting company',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Format organization number to have spaces between groups of digits
  const formatOrganizationNumber = (orgNumber: string | null): string => {
    if (!orgNumber) return '';
    
    // Remove any existing spaces or special characters
    const cleanNumber = orgNumber.replace(/\s+/g, '');
    
    // Add spaces after every 3 digits
    return cleanNumber.replace(/(\d{3})(?=\d)/g, '$1 ');
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    deleteCompanyMutation.mutate(company.id);
  };
  
  // Check if user can modify companies (admin or employee)
  const canModify = isAdmin || isEmployee;

  if (isLoading) return null;

  return (
    <>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/companies')} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Company Details</h1>
      </div>
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {company.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={`${company.name} logo`} 
                className="w-16 h-16 rounded-lg object-contain bg-white p-1 border"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                <Building className="h-8 w-8 text-gray-500" />
              </div>
            )}
            {company.is_partner && (
              <div className="absolute -bottom-2 left-0 right-0 flex justify-center">
                <Badge variant="partner" className="text-xs flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3" />
                  Partner
                </Badge>
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold">{company.name}</h2>
              <div className="flex gap-2">
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
              </div>
            </div>
            {company.organization_number && (
              <p className="text-gray-500">
                Org.nr: {formatOrganizationNumber(company.organization_number)}
              </p>
            )}
          </div>
        </div>
        
        {canModify && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleting(true)}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Edit Company Dialog */}
      <EditCompanyDialog
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        companyId={company.id}
      />

      {/* Delete Company Dialog */}
      <DeleteCompanyDialog
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDeleteConfirm}
        company={company}
        isDeleting={deleteCompanyMutation.isPending}
      />
    </>
  );
};
