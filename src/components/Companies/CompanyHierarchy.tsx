
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { Company } from '@/types/company';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Building2,
  Edit,
  Trash2,
} from 'lucide-react';
import { CreateCompanyDialog } from './CreateCompanyDialog';
import { EditCompanyDialog } from './EditCompanyDialog';
import { useAuth } from '@/contexts/AuthContext';

type CompanyHierarchyProps = {
  companyId: string;
  onSelectCompany: (company: Company) => void;
};

export const CompanyHierarchy = ({ companyId, onSelectCompany }: CompanyHierarchyProps) => {
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  
  const { isAdmin, isEmployee } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch child companies
  const { data: childCompanies = [], isLoading } = useQuery({
    queryKey: ['childCompanies', companyId],
    queryFn: () => companyService.getChildCompanies(companyId),
  });
  
  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: companyService.deleteCompany,
    onSuccess: () => {
      toast({
        title: 'Company deleted',
        description: 'The company has been deleted',
      });
      queryClient.invalidateQueries({ queryKey: ['childCompanies', companyId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete company: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Toggle expanded state of a node
  const toggleExpanded = (id: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Handle delete company
  const handleDeleteCompany = (id: string) => {
    if (confirm('Are you sure you want to delete this company? This will also delete all associated data.')) {
      deleteCompanyMutation.mutate(id);
    }
  };
  
  const canModify = isAdmin || isEmployee;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Subsidiaries</h2>
        {canModify && (
          <Button onClick={() => setIsAddingCompany(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subsidiary
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : childCompanies.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/10">
          <p>No subsidiaries added yet.</p>
          {canModify && (
            <Button variant="outline" className="mt-4" onClick={() => setIsAddingCompany(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Subsidiary
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {childCompanies.map(company => (
            <Card key={company.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2" onClick={() => onSelectCompany(company)} style={{ cursor: 'pointer' }}>
                    <Building2 className="h-5 w-5 text-gray-500" />
                    <CardTitle className="text-base">{company.name}</CardTitle>
                  </div>
                  
                  {canModify && (
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => {
                        onSelectCompany(company);
                        setIsEditingCompany(true);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCompany(company.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toggleExpanded(company.id)}>
                        {expandedNodes[company.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              {expandedNodes[company.id] && (
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="pl-5 border-l-2 border-gray-200 ml-3">
                    <CompanyHierarchyChild 
                      parentId={company.id}
                      onSelectCompany={onSelectCompany}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
      
      <CreateCompanyDialog
        isOpen={isAddingCompany}
        onClose={() => setIsAddingCompany(false)}
        parentId={companyId}
      />
      
      <EditCompanyDialog
        isOpen={isEditingCompany}
        onClose={() => setIsEditingCompany(false)}
        companyId={companyId}
      />
    </div>
  );
};

// Child component to handle recursive rendering
const CompanyHierarchyChild = ({ 
  parentId, 
  onSelectCompany 
}: { 
  parentId: string; 
  onSelectCompany: (company: Company) => void;
}) => {
  const { isAdmin, isEmployee } = useAuth();
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['childCompanies', parentId],
    queryFn: () => companyService.getChildCompanies(parentId),
  });
  
  const deleteCompanyMutation = useMutation({
    mutationFn: companyService.deleteCompany,
    onSuccess: () => {
      toast({
        title: 'Company deleted',
        description: 'The company has been deleted',
      });
      queryClient.invalidateQueries({ queryKey: ['childCompanies', parentId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete company: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const toggleExpanded = (id: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const handleDeleteCompany = (id: string) => {
    if (confirm('Are you sure you want to delete this company? This will also delete all associated data.')) {
      deleteCompanyMutation.mutate(id);
    }
  };
  
  const canModify = isAdmin || isEmployee;
  
  if (isLoading) {
    return <div className="py-2">Loading...</div>;
  }
  
  if (companies.length === 0) {
    return <div className="py-2 text-sm text-gray-500">No subsidiaries</div>;
  }
  
  return (
    <div className="space-y-2 mt-2">
      {companies.map(company => (
        <div key={company.id} className="border-b border-gray-100 last:border-b-0 pb-2">
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center space-x-2 py-1"
              onClick={() => onSelectCompany(company)}
              style={{ cursor: 'pointer' }}
            >
              <Building2 className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">{company.name}</span>
            </div>
            
            {canModify && (
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={() => handleDeleteCompany(company.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={() => toggleExpanded(company.id)}
                >
                  {expandedNodes[company.id] ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            )}
          </div>
          
          {expandedNodes[company.id] && (
            <div className="pl-5 border-l-2 border-gray-100 ml-3 mt-1">
              <CompanyHierarchyChild 
                parentId={company.id}
                onSelectCompany={onSelectCompany}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
