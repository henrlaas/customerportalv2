
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
  KeyRound
} from 'lucide-react';
import { CreateContactDialog } from './CreateContactDialog';
import { EditContactDialog } from './EditContactDialog';
import { EditUserDialog } from '@/components/UserManagement/EditUserDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';

type ContactsListProps = {
  companyId: string;
};

export const CompanyContactsList = ({ companyId }: ContactsListProps) => {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [selectedContact, setSelectedContact] = useState<CompanyContact | null>(null);
  
  const { isAdmin, isEmployee } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch contacts with improved query options
  const { data: contacts = [], isLoading, isError, error } = useQuery({
    queryKey: ['companyContacts', companyId],
    queryFn: () => companyService.fetchCompanyContacts(companyId),
    staleTime: 10000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
  
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

  // Password reset mutation
  const resetPasswordMutation = useMutation({
    mutationFn: userService.resetPassword,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Password reset email has been sent',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to send password reset email: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const handleContactAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['companyContacts', companyId] });
  };
  
  const handleEdit = (contact: CompanyContact) => {
    setSelectedContact(contact);
    setIsEditingContact(true);
  };

  const handleEditUser = (contact: CompanyContact) => {
    setSelectedContact(contact);
    setIsEditingUser(true);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this contact?')) {
      deleteContactMutation.mutate(id);
    }
  };

  const handleResetPassword = (email: string) => {
    resetPasswordMutation.mutate(email);
  };
  
  const canModify = isAdmin || isEmployee;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Company Contacts</h2>
        {canModify && (
          <Button onClick={() => setIsAddingContact(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : isError ? (
        <div className="text-center p-8 border rounded-lg bg-muted/10 text-destructive">
          <p>Error loading contacts: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <Button variant="outline" className="mt-4" onClick={() => 
            queryClient.invalidateQueries({ queryKey: ['companyContacts', companyId] })
          }>
            Retry
          </Button>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/10">
          <p>No contacts added yet.</p>
          {canModify && (
            <Button variant="outline" className="mt-4" onClick={() => setIsAddingContact(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Your First Contact
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contact.avatar_url || ''} alt={`${contact.first_name} ${contact.last_name}`} />
                      <AvatarFallback>
                        {(contact.first_name?.[0] || '')}{(contact.last_name?.[0] || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {contact.first_name || ''} {contact.last_name || ''}
                      </CardTitle>
                      {contact.position && <p className="text-sm text-muted-foreground">{contact.position}</p>}
                    </div>
                  </div>
                  
                  {canModify && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEditUser(contact)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit User Info
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(contact)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Contact Info
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(contact.email)}>
                          <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(contact.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {contact.is_primary && (
                    <Badge variant="outline" className="border-amber-500 text-amber-500">
                      <Star className="h-3 w-3 mr-1" /> Primary
                    </Badge>
                  )}
                  {contact.is_admin && (
                    <Badge variant="outline" className="border-blue-500 text-blue-500">
                      <Shield className="h-3 w-3 mr-1" /> Admin
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{contact.email}</span>
                  </div>
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

      <EditUserDialog
        isOpen={isEditingUser}
        onClose={() => {
          setIsEditingUser(false);
          setSelectedContact(null);
        }}
        user={selectedContact ? {
          id: selectedContact.user_id,
          email: selectedContact.email,
          user_metadata: {
            first_name: selectedContact.first_name,
            last_name: selectedContact.last_name
          },
          created_at: ''
        } : null}
      />
    </div>
  );
};
