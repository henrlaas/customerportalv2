
import React from 'react';
import { ContractList } from '@/components/ContractList';
import { useAuth } from '@/contexts/AuthContext';

const ContractsPage = () => {
  const { profile } = useAuth();

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Contracts</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all contracts with clients and partners
          </p>
        </div>
      </div>
      
      <ContractList />
    </div>
  );
};

export default ContractsPage;
