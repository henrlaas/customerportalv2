
import React, { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContractList } from '@/components/ContractList';
import { ContractTemplateEditor } from '@/components/ContractTemplateEditor';
import { useAuth } from '@/contexts/AuthContext';

// Loading placeholder component
const LoadingPlaceholder = () => (
  <div className="flex justify-center items-center p-12">
    <div className="flex flex-col items-center space-y-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
      <p>Loading content...</p>
    </div>
  </div>
);

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
        <Suspense fallback={<LoadingPlaceholder />}>
          <ContractList />
        </Suspense>
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
            <Suspense fallback={<LoadingPlaceholder />}>
              <ContractList />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="templates">
            <Suspense fallback={<LoadingPlaceholder />}>
              <ContractTemplateEditor />
            </Suspense>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ContractsPage;
