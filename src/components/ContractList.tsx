import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Trash2, ClipboardList, FilePlus, FileCheck, CheckCircle, XCircle } from 'lucide-react';
import { CreateContractDialog } from './CreateContractDialog';
import { DeleteContractDialog } from './DeleteContractDialog';
import { createPDF } from '@/utils/pdfUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { CompanyFavicon } from '@/components/CompanyFavicon';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useNavigate } from 'react-router-dom';

export const ContractList = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unsigned' | 'signed'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<ContractWithDetails | null>(null);
  
  const isClient = profile?.role === 'client';
  
  // Fetch contracts with optimized query configuration
  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts', user?.id, isClient],
    queryFn: async () => {
      if (!user) return [];
      
      console.time('fetchContractsTotal');
      let result;
      if (isClient) {
        result = await fetchClientContracts(user.id);
      } else {
        result = await fetchContracts();
      }
      console.timeEnd('fetchContractsTotal');
      console.log('Contracts fetched:', result); // Debug log to see if contracts are being fetched
      return result;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes before refetching
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
  });
  
  // Memoize filtered contracts 
  const filteredContracts = useMemo(() => {
    if (!contracts?.length) {
      console.log('No contracts available to filter'); // Debug log
      return [];
    }
    
    let result = [...contracts];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(contract => contract.status === statusFilter);
    }
    
    // Apply search filter
    const searchString = searchTerm.toLowerCase();
    if (!searchString) return result;
    
    return result.filter(contract => {
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
  }, [contracts, searchTerm, statusFilter]);
  
  // Memoize contract groups for better performance
  const { unsignedContracts, signedContracts } = useMemo(() => {
    if (!filteredContracts?.length) {
      return { unsignedContracts: [], signedContracts: [] };
    }
    
    return {
      unsignedContracts: filteredContracts.filter(contract => contract.status === 'unsigned'),
      signedContracts: filteredContracts.filter(contract => contract.status === 'signed')
    };
  }, [filteredContracts]);

  // Memoize action handlers to prevent unnecessary re-renders
  const downloadPdf = useCallback(async (contract: ContractWithDetails, e?: React.MouseEvent) => {
    if (isDownloading) return;
    
    // If called from a click event, stop propagation to prevent opening dialog
    if (e) {
      e.stopPropagation();
    }
    
    try {
      setIsDownloading(contract.id);
      const companyName = contract.company?.name || 'Company';
      // Sanitize filename to avoid special characters
      const sanitizedCompanyName = companyName.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
      const filename = `${contract.template_type}_${sanitizedCompanyName}.pdf`;
      
      toast({
        title: 'Preparing PDF',
        description: 'Starting PDF generation...',
      });
      
      await createPDF(contract.content, filename);
      
      toast({
        title: 'PDF Generated',
        description: 'Your contract PDF has been downloaded.',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download the contract PDF. Please check the console for details.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(null);
    }
  }, [toast, isDownloading]);
  
  const viewContract = useCallback((contract: ContractWithDetails) => {
    // Navigate to contract details page instead of opening a dialog
    navigate(`/contracts/${contract.id}`);
  }, [navigate]);
  
  const handleDeleteClick = useCallback((contract: ContractWithDetails, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from opening view dialog
    setContractToDelete(contract);
    setDeleteDialogOpen(true);
  }, []);

  // Stats cards component that prevents re-renders
  const StatsCards = React.memo(({ contracts }: { contracts: ContractWithDetails[] }) => {
    const unsignedCount = contracts.filter(c => c.status === 'unsigned').length;
    const signedCount = contracts.filter(c => c.status === 'signed').length;
    const totalCount = contracts.length;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalCount}</div>
                <p className="text-muted-foreground">Total Contracts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <FilePlus className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{unsignedCount}</div>
                <p className="text-muted-foreground">Unsigned Contracts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <FileCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{signedCount}</div>
                <p className="text-muted-foreground">Signed Contracts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  });
  
  // Skeleton loader for the stats cards
  const StatCardsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {[1, 2, 3].map((item) => (
        <Card key={item}>
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  // Skeleton loader for the contracts table
  const TableSkeleton = () => (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5).fill(0).map((_, index) => (
            <TableRow key={index}>
              <TableCell><div className="flex items-center gap-2"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-32" /></div></TableCell>
              <TableCell><div className="flex items-center gap-2"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-32" /></div></TableCell>
              <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><div className="flex items-center gap-2"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-24" /></div></TableCell>
              <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
              <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-8 w-8 rounded-full" /></div></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
  
  // Contract table component with memoization - updated with enhanced status badges
  const ContractTable = React.memo(({ contracts }: { contracts: ContractWithDetails[] }) => (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.length > 0 ? (
            contracts.map((contract) => (
              <TableRow 
                key={contract.id} 
                onClick={() => viewContract(contract)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CompanyFavicon 
                      companyName={contract.company?.name || 'Unknown'} 
                      website={contract.company?.website || null}
                      logoUrl={contract.company?.logo_url || null}
                      size="sm"
                    />
                    <span>{contract.company?.name || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {contract.contact && (
                      <UserAvatarGroup 
                        users={[{
                          id: contract.contact.user_id,
                          first_name: contract.contact.first_name || '',
                          last_name: contract.contact.last_name || '',
                          avatar_url: contract.contact.avatar_url
                        }]}
                        size="sm"
                      />
                    )}
                    <span>
                      {contract.contact ? 
                        `${contract.contact.first_name || ''} ${contract.contact.last_name || ''}`.trim() || 'N/A'
                        : 'N/A'
                      }
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                    {contract.template_type}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(contract.created_at), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {contract.created_by ? (
                      <>
                        <UserAvatarGroup 
                          users={[{
                            id: contract.created_by,
                            first_name: contract.creator?.first_name || '',
                            last_name: contract.creator?.last_name || '',
                            avatar_url: contract.creator?.avatar_url
                          }]}
                          size="sm"
                        />
                        <span>
                          {contract.creator ? 
                            `${contract.creator.first_name || ''} ${contract.creator.last_name || ''}`.trim() || 'N/A'
                            : 'System'
                          }
                        </span>
                      </>
                    ) : (
                      <span>System</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={contract.status === 'signed' ? "default" : "outline"} 
                    className={`inline-flex items-center gap-1 w-fit ${
                      contract.status === 'signed' 
                        ? "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-800"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-200 hover:text-amber-800"
                    }`}
                  >
                    {contract.status === 'signed' ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        <span>Signed</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        <span>Unsigned</span>
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => downloadPdf(contract, e)}
                      disabled={isDownloading === contract.id}
                      title="Download PDF"
                    >
                      {isDownloading === contract.id ? (
                        <span className="w-4 h-4 block rounded-full border-2 border-b-transparent border-r-transparent border-gray-400 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteClick(contract, e)}
                      title="Delete Contract"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No contracts found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  ));

  const FilterToggle = () => (
    <ToggleGroup 
      type="single" 
      value={statusFilter} 
      onValueChange={(value) => {
        if (value) setStatusFilter(value as 'all' | 'unsigned' | 'signed');
      }}
      className="border-0 bg-transparent p-0"
    >
      <ToggleGroupItem value="all" aria-label="View all contracts" variant="tab">All</ToggleGroupItem>
      <ToggleGroupItem value="unsigned" aria-label="View unsigned contracts" variant="tab">Unsigned</ToggleGroupItem>
      <ToggleGroupItem value="signed" aria-label="View signed contracts" variant="tab">Signed</ToggleGroupItem>
    </ToggleGroup>
  );
  
  // Debug output to inspect what's happening
  console.log('User:', user);
  console.log('Profile:', profile);
  console.log('Contracts loading:', isLoading);
  console.log('Contracts count:', contracts?.length || 0);
  console.log('Filtered contracts:', filteredContracts?.length || 0);
  
  return (
    <div className="space-y-6">
      {/* Contract Dashboard for Admins/Employees */}
      {!isClient && (
        isLoading ? (
          <StatCardsSkeleton />
        ) : (
          <StatsCards contracts={contracts} />
        )
      )}
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex-grow max-w-md">
          <Input
            placeholder="Search contracts..."
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <FilterToggle />
          {!isClient && (
            <CreateContractDialog onContractCreated={() => queryClient.invalidateQueries({ queryKey: ['contracts'] })} />
          )}
        </div>
      </div>
      
      {isClient ? (
        <Tabs defaultValue="unsigned">
          <TabsList className="mb-4">
            <TabsTrigger value="unsigned">Waiting for Signature</TabsTrigger>
            <TabsTrigger value="signed">Signed Contracts</TabsTrigger>
          </TabsList>
          <TabsContent value="unsigned">
            {isLoading ? <TableSkeleton /> : <ContractTable contracts={unsignedContracts} />}
          </TabsContent>
          <TabsContent value="signed">
            {isLoading ? <TableSkeleton /> : <ContractTable contracts={signedContracts} />}
          </TabsContent>
        </Tabs>
      ) : (
        isLoading ? <TableSkeleton /> : <ContractTable contracts={filteredContracts} />
      )}
      
      {contractToDelete && (
        <DeleteContractDialog
          contractId={contractToDelete.id}
          contractName={`${contractToDelete.template_type} for ${contractToDelete.company?.name || 'Unknown Company'}`}
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setContractToDelete(null);
          }}
          onDeleted={() => queryClient.invalidateQueries({ queryKey: ['contracts'] })}
        />
      )}
    </div>
  );
};
