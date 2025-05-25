import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  Phone,
  MoreVertical,
  Calendar,
  Clock
} from 'lucide-react';
import { CreateContactDialog } from './CreateContactDialog';
import { EditContactDialog } from './EditContactDialog';
import { DeleteContactConfirmDialog } from './DeleteContactConfirmDialog';
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
  
  // Sort contacts to show primary contacts first
  const sortedContacts = [...contacts].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return 0;
  });
  
  // Log query status for debugging
  console.log('Contacts query status:', { isLoading, isError, contactCount: contacts.length });
  if (isError && error) console.error('Contacts query error:', error);
  
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
  
  const handleDelete = (contact: CompanyContact) => {
    setSelectedContact(contact);
    setIsDeleteDialogOpen(true);
  };
  
  const canModify = isAdmin || isEmployee;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Company Contacts
          </h2>
          <p className="text-gray-600 mt-1">
            {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'} in this company
          </p>
        </div>
        {canModify && (
          <Button 
            onClick={() => setIsAddingContact(true)}
            style={{ backgroundColor: '#004843' }}
            className="hover:opacity-90 text-white"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="relative">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            <div className="absolute inset-0 animate-ping h-12 w-12 border-4 border-primary/20 rounded-full"></div>
          </div>
        </div>
      ) : isError ? (
        <div className="text-center p-12 border-2 border-dashed border-red-200 rounded-xl bg-red-50/50">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-lg font-semibold text-red-700 mb-2">Error loading contacts</p>
          <p className="text-red-600 mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <Button 
            variant="outline" 
            className="border-red-200 text-red-700 hover:bg-red-50" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['companyContacts', companyId] })}
          >
            Try Again
          </Button>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <UserPlus className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No contacts yet</h3>
          <p className="text-gray-500 mb-6">Start building your team by adding your first contact</p>
          {canModify && (
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              onClick={() => setIsAddingContact(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Your First Contact
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sortedContacts.map((contact) => (
            <Card key={contact.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-14 w-14 ring-4 ring-white shadow-lg">
                        <AvatarImage src={contact.avatar_url || ''} alt={`${contact.first_name} ${contact.last_name}`} />
                        <AvatarFallback 
                          className="font-semibold text-lg"
                          style={{ backgroundColor: '#E8EEEE', color: '#004843' }}
                        >
                          {(contact.first_name?.[0] || '')}{(contact.last_name?.[0] || '')}
                        </AvatarFallback>
                      </Avatar>
                      {contact.is_primary && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                          <Star className="h-3 w-3 text-white fill-current" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold text-gray-900 truncate">
                        {contact.first_name || ''} {contact.last_name || ''}
                      </CardTitle>
                      {contact.position && (
                        <p className="text-sm font-medium text-primary/80 mt-1 truncate">
                          {contact.position}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {canModify && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleEdit(contact)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive cursor-pointer" 
                          onClick={() => handleDelete(contact)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-6">
                  {contact.is_primary && (
                    <Badge 
                      variant="outline" 
                      className="border-amber-200 bg-amber-50 text-amber-700 font-medium px-3 py-1"
                    >
                      <Star className="h-3 w-3 mr-1 fill-current" /> Primary
                    </Badge>
                  )}
                  {contact.is_admin && (
                    <Badge 
                      variant="outline" 
                      className="border-blue-200 bg-blue-50 text-blue-700 font-medium px-3 py-1"
                    >
                      <Shield className="h-3 w-3 mr-1" /> Admin
                    </Badge>
                  )}
                  {!contact.is_verified && (
                    <Badge 
                      variant="outline" 
                      className="border-orange-200 bg-orange-50 text-orange-700 font-medium px-3 py-1"
                    >
                      <Clock className="h-3 w-3 mr-1" /> Waiting for verification
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center p-3 rounded-lg bg-gray-50/70 hover:bg-gray-100/70 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.email || 'No email'}
                      </p>
                      <p className="text-xs text-gray-500">Email address</p>
                    </div>
                  </div>
                  
                  {contact.phone_number && (
                    <div className="flex items-center p-3 rounded-lg bg-gray-50/70 hover:bg-gray-100/70 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {contact.phone_number}
                        </p>
                        <p className="text-xs text-gray-500">Phone number</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center p-3 rounded-lg bg-gray-50/70">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">Added to company</p>
                    </div>
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

      <DeleteContactConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        companyId={companyId}
      />
    </div>
  );
};
