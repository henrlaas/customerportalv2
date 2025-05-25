
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { Company } from '@/types/company';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subsidiaries</h2>
          <p className="text-gray-600 mt-1">
            {childCompanies.length} {childCompanies.length === 1 ? 'subsidiary' : 'subsidiaries'}
          </p>
        </div>
        {canModify && !isSubsidiary && (
          <Button 
            onClick={() => setIsAddingCompany(true)}
            style={{ backgroundColor: '#004843' }}
            className="hover:opacity-90 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Subsidiary
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="relative">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            <div className="absolute inset-0 animate-ping h-12 w-12 border-4 border-primary/20 rounded-full"></div>
          </div>
        </div>
      ) : isSubsidiary ? (
        <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="h-8 w-8 text-gray-500" />
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-2">Cannot add subsidiaries</p>
          <p className="text-gray-500">This company is already a subsidiary and cannot have subsidiaries of its own.</p>
        </div>
      ) : childCompanies.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8EEEE' }}>
            <Plus className="h-10 w-10" style={{ color: '#004843' }} />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No subsidiaries yet</h3>
          <p className="text-gray-500 mb-6">Start expanding your organization by adding your first subsidiary</p>
          {canModify && !isSubsidiary && (
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              onClick={() => setIsAddingCompany(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Subsidiary
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {childCompanies.map(company => (
            <CompanyHierarchyItem 
              key={company.id}
              company={company}
              onSelectCompany={onSelectCompany}
              onEditCompany={() => handleEditCompany(company.id)}
              activeSubsidiaryId={activeSubsidiaryId}
              setActiveSubsidiaryId={setActiveSubsidiaryId}
            />
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
