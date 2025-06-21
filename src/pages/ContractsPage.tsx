
import React from 'react';
import { ContractList } from '@/components/ContractList';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeContracts } from '@/hooks/realtime/useRealtimeContracts';

const ContractsPage = () => {
  const { profile, user } = useAuth();

  console.log('📄 ContractsPage: Setting up real-time monitoring for user:', user?.id);

  // Enable real-time updates for contracts
  useRealtimeContracts({ enabled: !!user?.id });

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
