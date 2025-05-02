
import React, { useState } from 'react';
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

// Mock data for contracts - in a real app, this would come from Supabase
const mockContracts = [
  { id: '1', name: 'Website Redesign Contract', status: 'active', value: 5000, client: 'Acme Corp', startDate: '2025-01-15', endDate: '2025-07-15' },
  { id: '2', name: 'SEO Services Agreement', status: 'pending', value: 1200, client: 'TechStart', startDate: '2025-02-01', endDate: '2025-05-01' },
  { id: '3', name: 'Content Marketing', status: 'completed', value: 3500, client: 'Global Media', startDate: '2024-11-01', endDate: '2025-03-01' },
  { id: '4', name: 'Social Media Management', status: 'active', value: 1800, client: 'Local Business', startDate: '2025-01-01', endDate: '2025-12-31' },
];

export const ContractsPage = () => {
  const [contracts, setContracts] = useState(mockContracts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  // Filter contracts based on search term and status filter
  const filteredContracts = contracts.filter((contract: any) => {
    const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contracts</h1>
        <Button>New Contract</Button>
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
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredContracts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredContracts.map((contract: any) => (
                <Card key={contract.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{contract.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <p className="text-sm">{contract.status}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Client</p>
                        <p className="text-sm">{contract.client}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Value</p>
                        <p className="text-sm">${contract.value}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-sm">{contract.startDate} to {contract.endDate}</p>
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
    </div>
  );
};

export default ContractsPage;
