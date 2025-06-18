
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { ContractTemplateEditor } from '@/components/ContractTemplateEditor';

export const ContractsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Contract Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage contract templates and document workflows
          </p>
        </div>
      </div>

      {/* Contract Template Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Templates
          </CardTitle>
          <CardDescription>
            Create and manage reusable contract templates with dynamic placeholders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContractTemplateEditor />
        </CardContent>
      </Card>
    </div>
  );
};
