
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Edit,
  Trash,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    deleteCompanyMutation.mutate(company.id);
  };
  
  // Check if user can modify companies (admin or employee)
  const canModify = isAdmin || isEmployee;

  if (isLoading || !canModify) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Company
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setIsDeleting(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Company
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
