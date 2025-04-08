
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { 
  Building,
  ArrowUpDown,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Company } from '@/types/company';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { companyService } from '@/services/companyService';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';

interface CompanyCardViewProps {
  companies: Company[];
  onCompanyClick: (company: Company) => void;
}

export const CompanyCardView = ({ companies, onCompanyClick }: CompanyCardViewProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin, isEmployee } = useAuth();
  
  const canModify = isAdmin || isEmployee;
  
  // Fetch users to get advisor information
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: userService.listUsers,
    // Only fetch if we have companies with advisors assigned
    enabled: companies.some(company => company.advisor_id)
  });
  
  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: companyService.deleteCompany,
    onSuccess: () => {
      toast({
        title: 'Company deleted',
        description: 'The company has been successfully deleted',
      });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting company',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this company? This will also delete all associated data.')) {
      deleteCompanyMutation.mutate(id);
    }
  };
  
  // Helper function to get advisor details
  const getAdvisorDetails = (advisorId: string | null) => {
    if (!advisorId) return null;
    
    const advisor = users.find(user => user.id === advisorId);
    if (!advisor) return null;
    
    return {
      name: `${advisor.user_metadata?.first_name || ''} ${advisor.user_metadata?.last_name || ''}`.trim() || advisor.email,
      email: advisor.email,
      avatarUrl: advisor.user_metadata?.avatar_url
    };
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company) => {
        const advisorDetails = getAdvisorDetails(company.advisor_id);
        
        return (
          <Card 
            key={company.id} 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => onCompanyClick(company)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {company.logo_url ? (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={company.logo_url} alt={company.name} />
                      <AvatarFallback>
                        <Building className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Building className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base font-medium">{company.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      {company.is_marketing_client && (
                        <Badge variant="marketing">
                          Marketing
                        </Badge>
                      )}
                      {company.is_web_client && (
                        <Badge variant="web">
                          Web
                        </Badge>
                      )}
                      {company.is_partner && (
                        <Badge variant="partner">
                          Partner
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {canModify && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowUpDown className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/companies/${company.id}`);
                      }}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(company.id);
                      }}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="space-y-2 text-sm text-gray-500">
                {company.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5" />
                    <a 
                      href={company.website} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company.invoice_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{company.invoice_email}</span>
                  </div>
                )}
                {company.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {company.city}
                      {company.country ? `, ${company.country}` : ''}
                    </span>
                  </div>
                )}
                {advisorDetails && (
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        {advisorDetails.avatarUrl ? (
                          <AvatarImage src={advisorDetails.avatarUrl} alt={advisorDetails.name} />
                        ) : (
                          <AvatarFallback className="text-xs">
                            {advisorDetails.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>{advisorDetails.name}</span>
                    </div>
                  </div>
                )}
              </div>
              {company.created_at && (
                <div className="flex items-center mt-4 text-xs text-gray-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    Created: {new Date(company.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
