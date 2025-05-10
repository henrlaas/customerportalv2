
import React, { useState } from 'react';
import { ContractList } from '@/components/ContractList';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MultiStepContractDialog } from '@/components/Contracts/MultiStepContractDialog';

const ContractsPage = () => {
  const { profile } = useAuth();
  const [isCreatingContract, setIsCreatingContract] = useState(false);

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contracts</h1>
        <Button onClick={() => setIsCreatingContract(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Contract
        </Button>
      </div>
      
      <ContractList />
      
      {isCreatingContract && (
        <MultiStepContractDialog 
          isOpen={isCreatingContract}
          onClose={() => setIsCreatingContract(false)}
        />
      )}
    </div>
  );
};

export default ContractsPage;
