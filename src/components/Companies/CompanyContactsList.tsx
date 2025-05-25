
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { CompanyContact } from '@/types/company';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Trash2,
  Edit,
  UserPlus,
  Mail,
  Star,
  Shield,
  Phone
} from 'lucide-react';
import { CreateContactDialog } from './CreateContactDialog';
import { EditContactDialog } from './EditContactDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

type ContactsListProps = {
  companyId: string;
};

export const CompanyContactsList = ({ companyId }: ContactsListProps) => {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<CompanyContact | null>(null);
  
  const { isAdmin, isEmployee } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch contacts with improved query options
  const { data: contacts = [], isLoading, isError, error } = useQuery({
    queryKey: ['companyContacts', companyId],
    queryFn: () => companyService.fetchCompanyContacts(companyId),
    staleTime: 10000, // Data considered fresh for 10 seconds
    refetchOnWindowFocus: true, // Refresh when window gets focus
    retry: 1, // Only retry once on failure
  });
  
  // Log query status for debugging
  console.log('Contacts query status:', { isLoading, isError, contactCount: contacts.length });
  if (isError && error) console.error('Contacts query error:', error);
  
  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => companyService.deleteContact(id),
    onSuccess: () => {
      toast({
        title: 'Contact removed',
        description: 'The contact has been removed from this company',
      });
      queryClient.invalidateQueries({ queryKey: ['companyContacts', companyId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to remove contact: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Handle successful contact creation
  const handleContactAdded = () => {
    // Force a refetch of the contacts data
    queryClient.invalidateQueries({ queryKey: ['companyContacts', companyId] });
  };
  
  // Handlers
  const handleEdit = (contact: CompanyContact) => {
    setSelectedContact(contact);
    setIsEditingContact(true);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this contact?')) {
      deleteContactMutation.mutate(id);
    }
  };
  
  const canModify = isAdmin || isEmployee;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Contacts</h2>
          <p className="text-gray-600 mt-1">Manage contacts for this company</p>
        </div>
        {canModify && (
          <Button onClick={() => setIsAddingContact(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : isError ? (
        <div className="text-center p-12 border-2 border-dashed border-red-200 rounded-lg bg-red-50">
          <div className="text-red-600 mb-4">
            <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Error loading contacts</p>
            <p className="text-sm mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
          <Button variant="outline" className="mt-4" onClick={() => 
            queryClient.invalidateQueries({ queryKey: ['companyContacts', companyId] })
          }>
            Try Again
          </Button>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <UserPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No contacts yet</h3>
          <p className="text-gray-500 mb-6">Start by adding your first contact for this company.</p>
          {canModify && (
            <Button onClick={() => setIsAddingContact(true)} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Your First Contact
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                      <AvatarImage 
                        src={contact.avatar_url || ''} 
                        alt={`${contact.first_name || ''} ${contact.last_name || ''}`} 
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {(contact.first_name?.[0] || '')}{(contact.last_name?.[0] || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold text-gray-900 truncate">
                        {contact.first_name || ''} {contact.last_name || ''}
                      </CardTitle>
                      {contact.position && (
                        <p className="text-sm text-gray-600 font-medium mt-1 truncate">
                          {contact.position}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {canModify && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleEdit(contact)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive cursor-pointer" 
                          onClick={() => handleDelete(contact.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                {/* Status badges */}
                {(contact.is_primary || contact.is_admin) && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {contact.is_primary && (
                      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-xs">
                        <Star className="h-3 w-3 mr-1" fill="currentColor" /> Primary Contact
                      </Badge>
                    )}
                    {contact.is_admin && (
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-xs">
                        <Shield className="h-3 w-3 mr-1" /> Admin Access
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Email */}
                  {contact.email && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <Mail className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                        <p className="text-sm text-gray-900 truncate font-medium">{contact.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Phone (if available in the contact data) */}
                  {contact.phone && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <Phone className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                        <p className="text-sm text-gray-900 truncate font-medium">{contact.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* If no contact info available */}
                  {!contact.email && !contact.phone && (
                    <div className="text-center py-4 text-gray-400">
                      <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No contact information available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <CreateContactDialog
        isOpen={isAddingContact}
        onClose={() => setIsAddingContact(false)}
        companyId={companyId}
        onSuccess={handleContactAdded}
      />
      
      <EditContactDialog
        isOpen={isEditingContact}
        onClose={() => {
          setIsEditingContact(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
      />
    </div>
  );
};
