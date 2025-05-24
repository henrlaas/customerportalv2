
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { 
  Building,
  ArrowUpDown,
  Globe,
  CheckCircle,
  User,
  Users,
  Trash,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Company } from '@/types/company';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { companyService } from '@/services/companyService';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';

interface CompanyListViewProps {
  companies: Company[];
  onCompanyClick: (company: Company) => void;
}

export const CompanyListView = ({ companies, onCompanyClick }: CompanyListViewProps) => {
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
      avatar_url: advisor.user_metadata?.avatar_url || null,
      // Use initials for avatar fallback
      initials: getInitials(advisor.user_metadata?.first_name, advisor.user_metadata?.last_name)
    };
  };
  
  // Helper function to get initials from name
  const getInitials = (firstName?: string, lastName?: string): string => {
    let initials = '';
    if (firstName) initials += firstName.charAt(0).toUpperCase();
    if (lastName) initials += lastName.charAt(0).toUpperCase();
    return initials || '??';
  };
  
  // Log users data to debug avatar_url
  console.log('Users data:', users);
  
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Company</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Partner</TableHead>
            <TableHead>Advisor</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => {
            const advisorDetails = getAdvisorDetails(company.advisor_id);
            
            return (
              <TableRow 
                key={company.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onCompanyClick(company)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {company.logo_url ? (
                        <img 
                          src={company.logo_url}
                          alt={company.name}
                          className="h-8 w-8 object-cover"
                        />
                      ) : (
                        <Building className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-xs text-gray-500">
                        {company.organization_number || 'No org. number'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
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
                    {!company.is_marketing_client && !company.is_web_client && (
                      <span className="text-gray-500 text-sm">None</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {company.website ? (
                    <a 
                      href={company.website} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Globe className="h-3 w-3" />
                      {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">No website</span>
                  )}
                </TableCell>
                <TableCell>
                  {company.is_partner ? (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span>Partner</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">No</span>
                  )}
                </TableCell>
                <TableCell>
                  {advisorDetails ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage 
                          src={advisorDetails.avatar_url} 
                          alt={advisorDetails.name} 
                        />
                        <AvatarFallback className="text-xs">
                          {advisorDetails.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{advisorDetails.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">Not assigned</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <span className="sr-only">Open menu</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => navigate(`/companies/${company.id}`)}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          {canModify && (
                            <DropdownMenuItem onClick={() => handleDelete(company.id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

