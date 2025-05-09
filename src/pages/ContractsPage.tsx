
import React, { Suspense, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContractList } from '@/components/ContractList';
import { ContractTemplateEditor } from '@/components/ContractTemplateEditor';
import { useAuth } from '@/contexts/AuthContext';
import { CenteredSpinner } from '@/components/ui/CenteredSpinner';

const ContractsPage = () => {
  const { profile } = useAuth();
  const isClient = profile?.role === 'client';
  const isAdmin = profile?.isAdmin || false; // Check if the user is an admin
  const [activeTab, setActiveTab] = useState('contracts');

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contracts</h1>
      </div>
      
      {isClient ? (
        // Client view - just show the contracts with immediate rendering
        <ContractList />
      ) : (
        // Admin/Employee view - tabs for contracts and templates (Templates only for admin)
        <Tabs defaultValue="contracts" value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6">
            <TabsList>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              {isAdmin && <TabsTrigger value="templates">Templates</TabsTrigger>}
            </TabsList>
          </div>
          
          <TabsContent value="contracts">
            {/* Load contract list directly for immediate UI feedback */}
            <ContractList />
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="templates">
              {/* Only load the template editor when the tab is active */}
              {activeTab === 'templates' && (
                <Suspense fallback={<CenteredSpinner />}>
                  <ContractTemplateEditor />
                </Suspense>
              )}
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
};

export default ContractsPage;
