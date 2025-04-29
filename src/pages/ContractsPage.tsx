
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploader } from "@/components/FileUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MultiStageContractDialog from '@/components/Contracts/MultiStageContractDialog';
import { useQuery } from '@tanstack/react-query';

type Contract = {
  id: string;
  title: string;
  status: string;
  value: number | null;
  company: string;
  startDate: string | null;
  endDate: string | null;
};

export const ContractsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch contract data using React Query
  const {
    data: contracts = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const { data: contractsData, error } = await supabase
        .from('contracts')
        .select(`
          id,
          title,
          status,
          value,
          start_date,
          end_date,
          company_id,
          companies(name)
        `);

      if (error) {
        throw error;
      }

      return contractsData.map((contract: any) => ({
        id: contract.id,
        title: contract.title,
        status: contract.status,
        value: contract.value,
        company: contract.companies?.name || 'Unknown Company',
        startDate: contract.start_date,
        endDate: contract.end_date,
      })) as Contract[];
    }
  });

  // Filter contracts based on search term and status filter
  const filteredContracts = contracts.filter((contract: Contract) => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          contract.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || filterStatus === 'all' || contract.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleFileUpload = async (file: File) => {
    try {
      // In a real app, you would upload to Supabase storage
      console.log("Uploading file:", file.name);
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `https://example.com/uploads/${file.name}`;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file");
    }
  };

  const handleFileUploaded = (url: string) => {
    toast({
      title: "File uploaded successfully",
      description: `File is available at ${url}`,
    });
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contracts</h1>
        <Button onClick={() => setDialogOpen(true)}>New Contract</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Input 
              placeholder="Search contracts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Select 
              value={filterStatus} 
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading contracts...</p>
            </div>
          ) : filteredContracts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredContracts.map((contract: Contract) => (
                <Card key={contract.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{contract.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <p className="text-sm capitalize">{contract.status}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Client</p>
                        <p className="text-sm">{contract.company}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Value</p>
                        <p className="text-sm">
                          {contract.value ? `$${contract.value.toLocaleString()}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-sm">
                          {formatDate(contract.startDate)} to {formatDate(contract.endDate)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No contracts found matching your filters.</p>
            </div>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload New Contract</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploader 
                onUpload={handleFileUpload}
                onUploaded={handleFileUploaded}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <MultiStageContractDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default ContractsPage;
