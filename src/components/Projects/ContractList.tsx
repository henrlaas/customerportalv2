
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ViewContractDialog } from './ViewContractDialog';
import { generateContractPDF } from '@/utils/contractUtils';
import { Contract } from '@/types/contract';

interface ContractListProps {
  projectId?: string;
  companyId?: string;
  showAll?: boolean;
  filter?: 'signed' | 'unsigned';
}

export const ContractList: React.FC<ContractListProps> = ({ 
  projectId,
  companyId,
  showAll = false,
  filter
}) => {
  const { user, isAdmin, isEmployee } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, [projectId, companyId, user, filter]);

  const fetchContracts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Create a query that avoids recursive types
      let query = supabase
        .from('contracts')
        .select(`
          id,
          template_type,
          company_id,
          contact_id,
          project_id,
          status,
          signed_at,
          signature_data,
          created_at,
          updated_at,
          created_by,
          file_url,
          title,
          companies:company_id (name),
          contacts:contact_id (
            position,
            user:user_id (
              profiles:profiles (
                first_name,
                last_name
              )
            )
          ),
          creators:created_by (
            profiles:profiles (
              first_name,
              last_name
            )
          )
        `);

      // Apply filters
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      
      // Filter by status if specified
      if (filter) {
        query = query.eq('status', filter);
      }
      
      // If not admin/employee and not showing all, only show user's contracts
      if (!isAdmin && !isEmployee && !showAll) {
        // Find company contacts where this user is associated
        const { data: userContacts } = await supabase
          .from('company_contacts')
          .select('id')
          .eq('user_id', user.id);
          
        if (userContacts && userContacts.length > 0) {
          const contactIds = userContacts.map(contact => contact.id);
          query = query.in('contact_id', contactIds);
        } else {
          // If user has no contacts, they shouldn't see any contracts
          setContracts([]);
          setLoading(false);
          return;
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Use type assertion to break the recursive type chain
        setContracts(data as unknown as Contract[]);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsViewDialogOpen(true);
  };

  const handleDownload = async (contract: Contract) => {
    try {
      await generateContractPDF(contract);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed':
        return 'bg-green-500';
      case 'unsigned':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTemplateTypeName = (type: string) => {
    switch (type) {
      case 'dpa':
        return 'DPA (Data Processing Agreement)';
      case 'nda':
        return 'NDA (Non-Disclosure Agreement)';
      case 'marketing':
        return 'Marketing';
      case 'web':
        return 'Web Development';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-8">Loading contracts...</div>
      ) : contracts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {getTemplateTypeName(contract.template_type)}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {contract.companies?.name}
                    </div>
                  </div>
                  <Badge className={getStatusColor(contract.status)}>
                    {contract.status === 'signed' ? 'Signed' : 'Unsigned'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div>
                    <span className="font-medium">Contact:</span>{" "}
                    {contract.contacts?.user?.profiles?.[0]?.first_name || ''}{" "}
                    {contract.contacts?.user?.profiles?.[0]?.last_name || ''}{" "}
                    {contract.contacts?.position && `(${contract.contacts.position})`}
                  </div>
                  <div>
                    <span className="font-medium">Created by:</span>{" "}
                    {contract.creators?.profiles?.[0]?.first_name || ''}{" "}
                    {contract.creators?.profiles?.[0]?.last_name || ''}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {contract.created_at ? format(new Date(contract.created_at), 'dd MMM yyyy') : 'N/A'}
                  </div>
                  {contract.status === 'signed' && contract.signed_at && (
                    <div>
                      <span className="font-medium">Signed:</span>{" "}
                      {format(new Date(contract.signed_at), 'dd MMM yyyy')}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewContract(contract)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  {(contract.status === 'signed' || isAdmin || isEmployee) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownload(contract)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p>No contracts found</p>
        </div>
      )}

      {selectedContract && (
        <ViewContractDialog 
          open={isViewDialogOpen} 
          onOpenChange={setIsViewDialogOpen} 
          contract={selectedContract} 
          onContractUpdated={fetchContracts}
        />
      )}
    </div>
  );
};
