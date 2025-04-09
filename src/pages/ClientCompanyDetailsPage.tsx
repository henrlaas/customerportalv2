
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Phone, Globe, Mail, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ClientCompanyDetailsPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch company details
  const fetchCompany = async () => {
    if (!user || !companyId) return null;
    
    // First verify the user has access to this company
    const { data: contactData } = await supabase
      .from('company_contacts')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('company_id', companyId);
    
    // If no direct access, check if it's a parent company
    if (!contactData || contactData.length === 0) {
      // Get companies the user has direct access to
      const { data: userCompanies } = await supabase
        .from('company_contacts')
        .select('company_id')
        .eq('user_id', user.id);
      
      if (!userCompanies || userCompanies.length === 0) return null;
      
      // Get their parent companies
      const { data: companies } = await supabase
        .from('companies')
        .select('parent_id')
        .in('id', userCompanies.map(c => c.company_id))
        .eq('parent_id', companyId);
      
      // No access to this company
      if (!companies || companies.length === 0) return null;
    }
    
    // Get company details
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
    
    return company;
  };
  
  const { data: company, isLoading, error } = useQuery({
    queryKey: ['clientCompany', companyId, user?.id],
    queryFn: fetchCompany,
    enabled: !!companyId && !!user,
  });
  
  useEffect(() => {
    // Redirect to dashboard if no access
    if (!isLoading && !company && !error) {
      navigate('/client-dashboard');
    }
  }, [company, isLoading, error, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!company) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <h2 className="text-2xl font-bold mt-4">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">
          You don't have permission to view this company.
        </p>
        <Button
          onClick={() => navigate('/client-dashboard')}
          className="mt-4"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate('/client-dashboard')}
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
          {company.address && <p className="text-muted-foreground">{company.address}</p>}
        </div>
        
        {company.logo_url && (
          <img 
            src={company.logo_url} 
            alt={`${company.name} logo`}
            className="h-16 w-16 object-contain"
          />
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Building className="mr-2 h-5 w-5" /> Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.organization_number && (
              <div>
                <p className="text-sm font-medium">Organization Number</p>
                <p>{company.organization_number}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium">Address</p>
              <p>{company.street_address || 'Not specified'}</p>
              {company.city && company.postal_code && (
                <p>
                  {company.city}, {company.postal_code}
                </p>
              )}
              <p>{company.country || ''}</p>
            </div>
            
            {(company.is_marketing_client || company.is_web_client) && (
              <div>
                <p className="text-sm font-medium">Services</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {company.is_marketing_client && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Marketing
                    </span>
                  )}
                  {company.is_web_client && (
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Web
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Mail className="mr-2 h-5 w-5" /> Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`tel:${company.phone}`} className="hover:underline">{company.phone}</a>
              </div>
            )}
            
            {company.invoice_email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`mailto:${company.invoice_email}`} className="hover:underline">{company.invoice_email}</a>
              </div>
            )}
            
            {company.website && (
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {company.website.replace(/(^\w+:|^)\/\//, '')}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientCompanyDetailsPage;
