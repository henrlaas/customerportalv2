
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContractList } from '@/components/ContractList';
import { ContractTemplateEditor } from '@/components/ContractTemplateEditor';
import { useAuth } from '@/contexts/AuthContext';

const ContractsPage = () => {
  const { profile } = useAuth();
  const isClient = profile?.role === 'client';

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contracts</h1>
      </div>
      
      {isClient ? (
        // Client view - just show the contracts
        <ContractList />
      ) : (
        // Admin/Employee view - tabs for contracts and templates
        <Tabs defaultValue="contracts">
          <div className="mb-6">
            <TabsList>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="contracts">
            <ContractList />
          </TabsContent>
          
          <TabsContent value="templates">
            <ContractTemplateEditor />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ContractsPage;
