
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { Company } from '@/types/company';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { CreateCompanyDialog } from './CreateCompanyDialog';
import { EditCompanyDialog } from './EditCompanyDialog';
import { CompanyHierarchyItem } from './CompanyHierarchyItem';

type CompanyHierarchyProps = {
  companyId: string;
  onSelectCompany: (company: Company) => void;
};

export const CompanyHierarchy = ({ companyId, onSelectCompany }: CompanyHierarchyProps) => {
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [activeSubsidiaryId, setActiveSubsidiaryId] = useState<string | null>(null);
  
  const { isAdmin, isEmployee } = useAuth();
  
  // Fetch parent company data
  const { data: parentCompany } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyService.getCompany(companyId),
    enabled: !!companyId,
  });
  
  // Fetch child companies
  const { data: childCompanies = [], isLoading } = useQuery({
    queryKey: ['childCompanies', companyId],
    queryFn: () => companyService.getChildCompanies(companyId),
  });
  
  const canModify = isAdmin || isEmployee;
  
  // Check if the current company is already a subsidiary
  const isSubsidiary = parentCompany?.parent_id !== null;

  const handleEditCompany = (companyId: string) => {
    setSelectedCompany(companyId);
    setIsEditingCompany(true);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Subsidiaries</h2>
        {canModify && !isSubsidiary && (
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
      ) : isSubsidiary ? (
        <div className="text-center p-8 border rounded-lg bg-muted/10">
          <p>This company is already a subsidiary and cannot have subsidiaries of its own.</p>
        </div>
      ) : childCompanies.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/10">
          <p>No subsidiaries added yet.</p>
          {canModify && !isSubsidiary && (
            <Button variant="outline" className="mt-4" onClick={() => setIsAddingCompany(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Subsidiary
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {childCompanies.map(company => (
            <Card key={company.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <CompanyHierarchyItem 
                  company={company}
                  onSelectCompany={onSelectCompany}
                  onEditCompany={() => handleEditCompany(company.id)}
                  activeSubsidiaryId={activeSubsidiaryId}
                  setActiveSubsidiaryId={setActiveSubsidiaryId}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {!isSubsidiary && (
        <CreateCompanyDialog
          isOpen={isAddingCompany}
          onClose={() => setIsAddingCompany(false)}
          parentId={companyId}
          parentCompany={parentCompany}
        />
      )}
      
      <EditCompanyDialog
        isOpen={isEditingCompany}
        onClose={() => {
          setIsEditingCompany(false);
          setSelectedCompany(null);
        }}
        companyId={selectedCompany || companyId}
      />
    </div>
  );
};

