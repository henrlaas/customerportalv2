import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Eye } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { MultiStageProjectContractDialog } from '@/components/Contracts/MultiStageProjectContractDialog';

interface ProjectContractCardProps {
  projectId: string;
  companyId?: string;
}

export const ProjectContractCard: React.FC<ProjectContractCardProps> = ({
  projectId,
  companyId
}) => {
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: contract, isLoading } = useQuery({
    queryKey: ['project-contract', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          company:company_id (name)
        `)
        .eq('project_id', projectId)
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching project contract:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!projectId
  });

  const handleContractSuccess = () => {
    // Invalidate the query to refetch the contract data
    queryClient.invalidateQueries({ queryKey: ['project-contract', projectId] });
  };

  const getContractStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Signed</Badge>;
      case 'unsigned':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Unsigned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleContractClick = () => {
    if (contract) {
      navigate(`/contracts/${contract.id}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Project Contract
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">
            <p className="text-gray-500">Loading contract...</p>
          </div>
        ) : contract ? (
          <div className="space-y-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-medium text-sm">{contract.title}</h4>
                {getContractStatusBadge(contract.status)}
              </div>
              
              <div className="text-xs text-gray-600 space-y-1">
                <p>Created: {formatDate(contract.created_at)}</p>
                <p>Company: {contract.company?.name}</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleContractClick}
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Contract
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-4 text-sm">No contract created yet</p>
            <Button 
              size="sm" 
              onClick={() => setIsContractDialogOpen(true)}
              disabled={!companyId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Contract
            </Button>
            {!companyId && (
              <p className="text-xs text-gray-400 mt-2">
                Project must have a company assigned
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Contract creation dialog */}
      {isContractDialogOpen && companyId && (
        <MultiStageProjectContractDialog
          isOpen={isContractDialogOpen}
          onClose={() => setIsContractDialogOpen(false)}
          projectId={projectId}
          companyId={companyId}
          projectName="Project Contract"
          onSuccess={handleContractSuccess}
        />
      )}
    </Card>
  );
};
