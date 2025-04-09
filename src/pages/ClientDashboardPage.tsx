
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, FileText, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ClientDashboardPage = () => {
  const { user, profile } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  
  // Fetch companies the client has access to
  const fetchClientCompanies = async () => {
    if (!user) return [];
    
    const { data: contactData, error: contactError } = await supabase
      .from('company_contacts')
      .select('company_id')
      .eq('user_id', user.id);
      
    if (contactError) throw new Error(contactError.message);
    
    if (contactData && contactData.length > 0) {
      const companyIds = contactData.map(contact => contact.company_id);
      
      // Get companies and their parent companies if they exist
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*, parent:parent_id(*)')
        .in('id', companyIds);
        
      if (companyError) throw new Error(companyError.message);
      return companyData || [];
    }
    
    return [];
  };
  
  const { data: clientCompanies = [], isLoading } = useQuery({
    queryKey: ['clientCompanies', user?.id],
    queryFn: fetchClientCompanies,
    enabled: !!user,
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.first_name}</h1>
        <p className="text-muted-foreground">
          Here's an overview of your company information
        </p>
      </div>
      
      {clientCompanies.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No companies found</h3>
            <p className="text-muted-foreground mb-4">
              You don't seem to be associated with any companies yet.
            </p>
            <p className="text-sm">
              If you believe this is an error, please contact your account manager.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clientCompanies.map((company) => (
            <Card key={company.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-2">
                {company.logo_url && (
                  <img 
                    src={company.logo_url} 
                    alt={`${company.name} logo`}
                    className="h-10 w-10 mb-2 object-contain"
                  />
                )}
                <CardTitle className="text-lg">
                  {company.name}
                </CardTitle>
                {company.parent && (
                  <div className="text-sm text-muted-foreground">
                    Subsidiary of {company.parent.name}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="text-sm">
                    <Link to={`/client/companies/${company.id}`}>
                      <Button variant="outline" className="w-full">View Details</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Tasks" 
          value="0" 
          description="Pending tasks"
          icon={<Clock className="h-5 w-5" />}
          linkTo="/client/tasks"
        />
        <DashboardCard 
          title="Contracts" 
          value="0" 
          description="Active contracts"
          icon={<FileText className="h-5 w-5" />}
          linkTo="/client/contracts"
        />
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, description, icon, linkTo }: { 
  title: string; 
  value: string; 
  description: string;
  icon: React.ReactNode;
  linkTo: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="mt-3">
        <Link to={linkTo}>
          <Button variant="outline" size="sm" className="w-full">View</Button>
        </Link>
      </div>
    </CardContent>
  </Card>
);

export default ClientDashboardPage;
