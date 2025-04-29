
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileIcon } from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface ReviewStepProps {
  contractData: {
    title: string;
    value: string;
    status: string;
    start_date: string;
    end_date: string;
    company_id: string;
    file_url: string;
  };
  companies: Company[];
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ contractData, companies }) => {
  // Find the selected company
  const selectedCompany = companies.find(company => company.id === contractData.company_id);
  
  // Format date if available
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  // Format status
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Review Contract</h2>
      <p className="text-sm text-muted-foreground">
        Please review the contract details before creating.
      </p>

      <Card>
        <CardContent className="pt-6">
          <dl className="grid grid-cols-1 gap-4 text-sm">
            <div className="grid grid-cols-3 gap-4 py-3 border-b">
              <dt className="font-medium text-muted-foreground">Contract Title</dt>
              <dd className="col-span-2">{contractData.title}</dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-3 border-b">
              <dt className="font-medium text-muted-foreground">Company</dt>
              <dd className="col-span-2">{selectedCompany?.name || 'Unknown'}</dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-3 border-b">
              <dt className="font-medium text-muted-foreground">Value</dt>
              <dd className="col-span-2">
                {contractData.value ? `$${parseFloat(contractData.value).toFixed(2)}` : 'Not specified'}
              </dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-3 border-b">
              <dt className="font-medium text-muted-foreground">Status</dt>
              <dd className="col-span-2">{formatStatus(contractData.status)}</dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-3 border-b">
              <dt className="font-medium text-muted-foreground">Date Range</dt>
              <dd className="col-span-2">
                {contractData.start_date ? (
                  `${formatDate(contractData.start_date)} to ${formatDate(contractData.end_date || '')}`
                ) : (
                  'Date range not specified'
                )}
              </dd>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-3">
              <dt className="font-medium text-muted-foreground">Contract Document</dt>
              <dd className="col-span-2">
                {contractData.file_url ? (
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4" />
                    <span>Document uploaded</span>
                  </div>
                ) : (
                  'No document uploaded'
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        Click "Create Contract" below to finalize and create this contract.
      </div>
    </div>
  );
};
