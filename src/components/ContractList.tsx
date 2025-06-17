
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Search, Download, Eye, Trash2, Edit, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CreateContractDialog } from './CreateContractDialog';
import { DeleteContractDialog } from './DeleteContractDialog';
import { ViewContractDialog } from './ViewContractDialog';

type Contract = {
  id: string;
  title?: string | null;
  description?: string | null;
  contract_type?: string | null;
  status: 'unsigned' | 'signed' | 'draft' | 'sent' | 'expired';
  created_at: string;
  updated_at: string;
  client_name?: string | null;
  client_email?: string | null;
  company_id: string | null;
  contact_id: string | null;
  file_path?: string | null;
  file_url?: string | null;
  template_type: string;
  content?: string | null;
  project_id?: string | null;
  created_by?: string | null;
  signed_at?: string | null;
  signature_data?: string | null;
  companies?: {
    id: string;
    name: string;
  } | null;
  contacts?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
};

const StatsCards = React.memo(({ contracts, isLoading }: { contracts: Contract[]; isLoading: boolean }) => {
  if (isLoading) {
    return <StatCardsSkeleton />;
  }

  const totalContracts = contracts.length;
  const unsignedContracts = contracts.filter(c => c.status !== 'signed').length;
  const signedContracts = contracts.filter(c => c.status === 'signed').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-blue-50 text-blue-700 border-blue-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Total Contracts</p>
              <p className="text-2xl font-bold mt-1">{totalContracts}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-orange-50 text-orange-700 border-orange-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Unsigned Contracts</p>
              <p className="text-2xl font-bold mt-1">{unsignedContracts}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-green-50 text-green-700 border-green-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Signed Contracts</p>
              <p className="text-2xl font-bold mt-1">{signedContracts}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

const StatCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse bg-gray-50 border">
          <CardContent className="p-4">
            <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-1"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default function ContractList() {
  const { isAdmin } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [contractToView, setContractToView] = useState<Contract | null>(null);

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          companies (id, name),
          contacts (id, first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch contracts: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.companies?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      sent: 'outline',
      signed: 'default',
      unsigned: 'outline',
      expired: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleDownload = async (contract: Contract) => {
    if (!contract.file_path && !contract.file_url) {
      toast.error('No file available for download');
      return;
    }

    try {
      const filePath = contract.file_path || contract.file_url;
      if (!filePath) return;

      const { data, error } = await supabase.storage
        .from('contracts')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contract.title || 'contract'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Contract downloaded successfully');
    } catch (error: any) {
      toast.error('Failed to download contract: ' + error.message);
    }
  };

  const handleDelete = async (contractId: string) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', contractId);

      if (error) throw error;
      
      setContracts(contracts.filter(c => c.id !== contractId));
      toast.success('Contract deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete contract: ' + error.message);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Contracts</h1>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Contract
        </Button>
      </div>

      <p className="text-muted-foreground mb-8">
        Manage and track all your contracts in one place. Create, send, and monitor contract status.
      </p>

      <StatsCards contracts={contracts} isLoading={isLoading} />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
                <SelectItem value="unsigned">Unsigned</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contract List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No contracts found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Get started by creating your first contract'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Contract
                  </Button>
                )}
              </div>
            ) : (
              filteredContracts.map((contract) => (
                <Card key={contract.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{contract.title || 'Untitled Contract'}</h3>
                          {getStatusBadge(contract.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            <span className="font-medium">Client:</span>{' '}
                            {contract.companies?.name || contract.client_name || 'N/A'}
                          </p>
                          <p>
                            <span className="font-medium">Type:</span> {contract.contract_type || contract.template_type || 'N/A'}
                          </p>
                          <p>
                            <span className="font-medium">Created:</span>{' '}
                            {format(new Date(contract.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setContractToView(contract)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(contract.file_path || contract.file_url) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(contract)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setContractToDelete(contract)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <CreateContractDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={fetchContracts}
      />

      <DeleteContractDialog
        contractId={contractToDelete?.id || ''}
        onClose={() => setContractToDelete(null)}
        onConfirm={(contractId) => {
          handleDelete(contractId);
          setContractToDelete(null);
        }}
      />

      {contractToView && (
        <ViewContractDialog
          contract={contractToView}
          isOpen={true}
          onClose={() => setContractToView(null)}
        />
      )}
    </div>
  );
}
