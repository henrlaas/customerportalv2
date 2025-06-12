
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, CheckCircle, Clock, Calendar, User } from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  status: string;
  created_at: string;
  created_by: string | null;
  company: {
    name: string;
  } | null;
  contact: {
    id: string;
    user_id: string;
    position: string | null;
    profiles?: {
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
  creator?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ContractSummaryCardsProps {
  contracts: Contract[];
}

export const ContractSummaryCards: React.FC<ContractSummaryCardsProps> = ({ contracts }) => {
  // Calculate statistics
  const totalContracts = contracts.length;
  const signedContracts = contracts.filter(c => c.status === 'signed').length;
  const unsignedContracts = contracts.filter(c => c.status === 'unsigned').length;
  
  // Recent contracts (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentContracts = contracts.filter(c => new Date(c.created_at) > thirtyDaysAgo).length;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getInitials = (firstName: string | null, lastName: string | null): string => {
    return `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}` || '?';
  };

  const getDisplayName = (firstName: string | null, lastName: string | null): string => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    }
    return 'Unknown User';
  };

  // Helper function to safely get contact profiles
  const getContactProfiles = (contact: Contract['contact']) => {
    if (!contact || !contact.profiles || typeof contact.profiles !== 'object') {
      return null;
    }
    
    // Check if profiles is an error object
    if ('error' in contact.profiles) {
      return null;
    }
    
    return contact.profiles;
  };

  if (totalContracts === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5 text-primary" />
          Contract Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              <p className="text-sm text-muted-foreground">Recent (30d)</p>
              <p className="text-xl font-semibold text-purple-600">{recentContracts}</p>
            </div>
          </div>
        </div>

        {/* Individual Contract Information */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Contract Details</h4>
          {contracts.map((contract) => {
            const contactProfiles = getContactProfiles(contract.contact);
            
            return (
              <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">{contract.title}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Created: {formatDate(contract.created_at)}</span>
                      {contract.company && (
                        <span>Company: {contract.company.name}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Contact Information */}
                  {contactProfiles && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        {contactProfiles.avatar_url ? (
                          <AvatarImage src={contactProfiles.avatar_url} />
                        ) : (
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(contactProfiles.first_name, contactProfiles.last_name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="text-xs">
                        <p className="font-medium">
                          {getDisplayName(contactProfiles.first_name, contactProfiles.last_name)}
                        </p>
                        <p className="text-muted-foreground">Contact</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Creator Information */}
                  {contract.creator && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        {contract.creator.avatar_url ? (
                          <AvatarImage src={contract.creator.avatar_url} />
                        ) : (
                          <AvatarFallback className="text-xs bg-secondary/50 text-secondary-foreground">
                            {getInitials(contract.creator.first_name, contract.creator.last_name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="text-xs">
                        <p className="font-medium">
                          {getDisplayName(contract.creator.first_name, contract.creator.last_name)}
                        </p>
                        <p className="text-muted-foreground">Creator</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  {getContractStatusBadge(contract.status)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
