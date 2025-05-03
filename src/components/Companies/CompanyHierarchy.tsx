
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
import { Plus, Building2 } from 'lucide-react';
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
  
  // Fetch parent company data - use fetchCompanyById instead of getCompany
  const { data: parentCompany } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyService.fetchCompanyById(companyId),
    enabled: !!companyId,
  });
  
  // Fetch child companies - use fetchChildCompanies instead of getChildCompanies
  const { data: childCompanies = [], isLoading } = useQuery({
    queryKey: ['childCompanies', companyId],
    queryFn: () => companyService.fetchChildCompanies(companyId),
  });
  
  const canModify = isAdmin || isEmployee;
  
  // Check if the current company is already a subsidiary
  const isSubsidiary = parentCompany?.parent_id !== null;

  const handleEditCompany = (companyId: string) => {
    setSelectedCompany(companyId);
    setIsEditingCompany(true);
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-evergreen" />
          Subsidiaries
        </h2>
        {canModify && !isSubsidiary && (
          <Button onClick={() => setIsAddingCompany(true)} className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-evergreen to-evergreen/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Subsidiary
            </div>
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-evergreen border-t-transparent rounded-full"></div>
        </div>
      ) : isSubsidiary ? (
        <div className="text-center p-8 border rounded-xl bg-soft-blue/10 border-dashed">
          <p className="text-gray-600">This company is already a subsidiary and cannot have subsidiaries of its own.</p>
        </div>
      ) : childCompanies.length === 0 ? (
        <div className="text-center p-8 border-2 rounded-xl border-dashed border-gray-200 bg-gradient-to-b from-white to-soft-blue/5">
          <div className="mb-3 text-5xl">🏢</div>
          <p className="text-gray-600 mb-4">No subsidiaries added yet.</p>
          {canModify && !isSubsidiary && (
            <Button 
              variant="outline" 
              className="border-evergreen/30 hover:bg-evergreen/5 transition-all" 
              onClick={() => setIsAddingCompany(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Subsidiary
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {childCompanies.map(company => (
            <Card key={company.id} className="overflow-hidden hover:shadow-playful transition-all duration-300 border-transparent group">
              <div className="absolute inset-0 bg-gradient-to-r from-soft-blue/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
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
