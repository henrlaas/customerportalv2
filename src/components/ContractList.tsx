
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Contract, ContractWithDetails, fetchContracts, fetchClientContracts } from '@/utils/contractUtils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, FileText, Download } from 'lucide-react';
import { CreateContractDialog } from './CreateContractDialog';
import { ViewContractDialog } from './ViewContractDialog';
import { createPDF } from '@/utils/pdfUtils';

export const ContractList = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<ContractWithDetails | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  const isClient = profile?.role === 'client';
  
  // Fetch contracts based on user role
  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts', user?.id, isClient],
    queryFn: async () => {
      if (!user) return [];
      
      if (isClient) {
        return await fetchClientContracts(user.id);
      } else {
        return await fetchContracts();
      }
    },
    enabled: !!user,
  });
  
  // Filter contracts based on search term
  const filteredContracts = contracts.filter(contract => {
    const searchString = searchTerm.toLowerCase();
    const companyName = contract.company?.name?.toLowerCase() || '';
    const contactName = `${contract.contact?.first_name || ''} ${contract.contact?.last_name || ''}`.toLowerCase();
    const status = contract.status.toLowerCase();
    const type = contract.template_type.toLowerCase();
    
    return (
      companyName.includes(searchString) ||
      contactName.includes(searchString) ||
      status.includes(searchString) ||
      type.includes(searchString)
    );
  });
  
  // Sort contracts: unsigned first, then by date
  const unsignedContracts = filteredContracts.filter(contract => contract.status === 'unsigned');
  const signedContracts = filteredContracts.filter(contract => contract.status === 'signed');

  const downloadPdf = async (contract: ContractWithDetails) => {
    try {
      const companyName = contract.company?.name || 'Company';
      const filename = `${contract.template_type}_${companyName.replace(/\s+/g, '_')}.pdf`;
      
      await createPDF(contract.content, filename);
      
      toast({
        title: 'Download started',
        description: 'Your contract PDF is being generated.',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download the contract PDF.',
        variant: 'destructive',
      });
    }
  };
  
  const viewContract = (contract: ContractWithDetails) => {
    setSelectedContract(contract);
    setViewDialogOpen(true);
  };
  
  const renderContractTable = (contracts: ContractWithDetails[]) => (
    <Table className="border">
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Company</TableHead>
          {!isClient && <TableHead>Contact</TableHead>}
          <TableHead>Created Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[80px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contracts.length > 0 ? (
          contracts.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell>{contract.template_type}</TableCell>
              <TableCell>{contract.company?.name || 'N/A'}</TableCell>
              {!isClient && (
                <TableCell>
                  {`${contract.contact?.first_name || ''} ${contract.contact?.last_name || ''}`.trim() || 'N/A'}
                </TableCell>
              )}
              <TableCell>{format(new Date(contract.created_at), 'MMM d, yyyy')}</TableCell>
              <TableCell>
                <Badge variant={contract.status === 'signed' ? 'default' : 'outline'}>
                  {contract.status === 'signed' ? 'Signed' : 'Unsigned'}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => viewContract(contract)}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Contract
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => downloadPdf(contract)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={isClient ? 5 : 6} className="text-center py-8">
              No contracts found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading contracts...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Contract Dashboard for Admins/Employees */}
      {!isClient && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{contracts.length}</div>
              <p className="text-muted-foreground">Total Contracts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{unsignedContracts.length}</div>
              <p className="text-muted-foreground">Unsigned Contracts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{signedContracts.length}</div>
              <p className="text-muted-foreground">Signed Contracts</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search contracts..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {!isClient && (
          <CreateContractDialog onContractCreated={() => queryClient.invalidateQueries({ queryKey: ['contracts'] })} />
        )}
      </div>
      
      {isClient ? (
        <Tabs defaultValue="unsigned">
          <TabsList className="mb-4">
            <TabsTrigger value="unsigned">Waiting for Signature</TabsTrigger>
            <TabsTrigger value="signed">Signed Contracts</TabsTrigger>
          </TabsList>
          <TabsContent value="unsigned">
            {renderContractTable(unsignedContracts)}
          </TabsContent>
          <TabsContent value="signed">
            {renderContractTable(signedContracts)}
          </TabsContent>
        </Tabs>
      ) : (
        renderContractTable(filteredContracts)
      )}
      
      {selectedContract && (
        <ViewContractDialog
          contract={selectedContract}
          isOpen={viewDialogOpen}
          onClose={() => {
            setViewDialogOpen(false);
            setSelectedContract(null);
          }}
          onContractSigned={() => queryClient.invalidateQueries({ queryKey: ['contracts'] })}
        />
      )}
    </div>
  );
};
