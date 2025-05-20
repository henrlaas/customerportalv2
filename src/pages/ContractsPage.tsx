
import React from 'react';
import { ContractList } from '@/components/ContractList';
import { useAuth } from '@/contexts/AuthContext';
import { CreateContractDialog } from '@/components/CreateContractDialog';

const ContractsPage = () => {
  const { profile } = useAuth();

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contracts</h1>
        <CreateContractDialog />
      </div>
      
      <ContractList />
    </div>
  );
};

export default ContractsPage;
