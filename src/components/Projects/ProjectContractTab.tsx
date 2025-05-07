
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { FileText } from "lucide-react";
import { ContractList } from './ContractList';
import { CreateContractDialog } from './CreateContractDialog';

interface ProjectContractTabProps {
  projectId: string;
  companyId?: string;
}

export const ProjectContractTab: React.FC<ProjectContractTabProps> = ({ 
  projectId,
  companyId
}) => {
  const { isAdmin, isEmployee } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [contractsUpdated, setContractsUpdated] = useState(false);

  const handleContractCreated = () => {
    setContractsUpdated(!contractsUpdated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Contracts</h3>
        {(isAdmin || isEmployee) && (
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Create Contract
          </Button>
        )}
      </div>

      {!isAdmin && !isEmployee && (
        <Tabs defaultValue="unsigned" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="unsigned">Waiting for Signature</TabsTrigger>
            <TabsTrigger value="signed">Signed Contracts</TabsTrigger>
          </TabsList>
          <TabsContent value="unsigned">
            <ContractList 
              projectId={projectId} 
              companyId={companyId} 
              filter="unsigned"
            />
          </TabsContent>
          <TabsContent value="signed">
            <ContractList 
              projectId={projectId} 
              companyId={companyId} 
              filter="signed"
            />
          </TabsContent>
        </Tabs>
      )}

      {(isAdmin || isEmployee) && (
        <ContractList projectId={projectId} companyId={companyId} showAll />
      )}

      <CreateContractDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectId={projectId}
        onSuccess={handleContractCreated}
      />
    </div>
  );
};
