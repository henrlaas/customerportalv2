
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Clock, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface ContractSummaryCardsProps {
  contracts: any[];
}

export const ContractSummaryCards: React.FC<ContractSummaryCardsProps> = ({ contracts }) => {
  // Calculate contract statistics
  const totalContracts = contracts.length;
  const signedContracts = contracts.filter(c => c.status === 'signed').length;
  const unsignedContracts = contracts.filter(c => c.status === 'unsigned').length;
  const recentContracts = contracts.filter(c => {
    const createdDate = new Date(c.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate >= weekAgo;
  }).length;

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
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-primary" />
            Contract Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-semibold">{totalContracts}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Signed</p>
                <p className="text-xl font-semibold text-green-600">{signedContracts}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unsigned</p>
                <p className="text-xl font-semibold text-yellow-600">{unsignedContracts}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recent (7d)</p>
                <p className="text-xl font-semibold text-purple-600">{recentContracts}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Details Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contract Details</h3>
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-lg">{contract.title}</h4>
                  </div>
                  {getContractStatusBadge(contract.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {/* Contact Information */}
                  <div className="space-y-2">
                    <p className="font-medium text-gray-600">Sent to Contact:</p>
                    <div className="flex items-center gap-2">
                      {contract.contact?.profiles?.avatar_url ? (
                        <img
                          src={contract.contact.profiles.avatar_url}
                          alt={`${contract.contact.profiles.first_name} ${contract.contact.profiles.last_name}`}
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-3 w-3 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {contract.contact?.profiles?.first_name} {contract.contact?.profiles?.last_name}
                        </p>
                        {contract.contact?.position && (
                          <p className="text-gray-500 text-xs">{contract.contact.position}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Creator Information */}
                  <div className="space-y-2">
                    <p className="font-medium text-gray-600">Created by:</p>
                    <div className="flex items-center gap-2">
                      {contract.creator?.avatar_url ? (
                        <img
                          src={contract.creator.avatar_url}
                          alt={`${contract.creator.first_name} ${contract.creator.last_name}`}
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-3 w-3 text-gray-500" />
                        </div>
                      )}
                      <p className="font-medium">
                        {contract.creator ? 
                          `${contract.creator.first_name || ''} ${contract.creator.last_name || ''}`.trim() || 'Unknown User'
                          : 'Unknown User'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Creation Date */}
                  <div className="space-y-2">
                    <p className="font-medium text-gray-600">Created:</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <p>{formatDate(contract.created_at)}</p>
                    </div>
                    {contract.signed_at && (
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="text-green-600 text-xs">Signed: {formatDate(contract.signed_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
