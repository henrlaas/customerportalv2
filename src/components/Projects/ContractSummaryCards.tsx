
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, CheckCircle, Clock, User, Calendar } from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  status: string;
  created_at: string;
  signed_at?: string;
  company?: {
    name: string;
  };
  contact?: {
    id: string;
    user_id: string;
    position?: string;
  };
  creator?: {
    first_name?: string;
    last_name?: string;
  };
  contact_profile?: {
    first_name?: string;
    last_name?: string;
  };
}

interface ContractSummaryCardsProps {
  contracts: Contract[];
}

export const ContractSummaryCards: React.FC<ContractSummaryCardsProps> = ({ contracts }) => {
  // Calculate contract statistics
  const totalContracts = contracts.length;
  const signedContracts = contracts.filter(c => c.status === 'signed').length;
  const unsignedContracts = contracts.filter(c => c.status === 'unsigned').length;
  
  // Calculate recently created contracts (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentContracts = contracts.filter(c => 
    new Date(c.created_at) >= thirtyDaysAgo
  ).length;

  const signedPercentage = totalContracts > 0 ? Math.round((signedContracts / totalContracts) * 100) : 0;

  // Helper function to format contact name
  const getContactName = (contract: Contract) => {
    if (contract.contact_profile?.first_name || contract.contact_profile?.last_name) {
      return `${contract.contact_profile.first_name || ''} ${contract.contact_profile.last_name || ''}`.trim();
    }
    return 'Unknown Contact';
  };

  // Helper function to format creator name
  const getCreatorName = (contract: Contract) => {
    if (contract.creator?.first_name || contract.creator?.last_name) {
      return `${contract.creator.first_name || ''} ${contract.creator.last_name || ''}`.trim();
    }
    return 'Unknown Creator';
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Contract Statistics Overview */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-primary" />
            Contract Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
              <div className="p-2 bg-orange-100 rounded-full">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unsigned</p>
                <p className="text-xl font-semibold text-orange-600">{unsignedContracts}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recent (30d)</p>
                <p className="text-xl font-semibold text-purple-600">{recentContracts}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Signing Progress</span>
              <span className="text-sm text-muted-foreground">{signedPercentage}%</span>
            </div>
            <Progress value={signedPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Contract Details Summary */}
      {contracts.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-primary" />
              Contract Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{contract.title}</h4>
                      <Badge variant={contract.status === 'signed' ? 'default' : 'outline'}>
                        {contract.status === 'signed' ? 'Signed' : 'Unsigned'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-4">
                        <span>Contact: {getContactName(contract)}</span>
                        <span>Created by: {getCreatorName(contract)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span>Created: {formatDate(contract.created_at)}</span>
                        {contract.signed_at && (
                          <span>Signed: {formatDate(contract.signed_at)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
