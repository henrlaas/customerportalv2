
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { FormData } from './types';
import { Card, CardContent } from '@/components/ui/card';

interface ContactSelectionStageProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export function ContactSelectionStage({ formData, setFormData }: ContactSelectionStageProps) {
  // Determine which company ID to use for fetching contacts
  const contactCompanyId = formData.company?.parent_id || formData.company?.id;
  const isSubsidiary = formData.company?.parent_id ? true : false;

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['company-contacts', contactCompanyId],
    queryFn: async () => {
      if (!contactCompanyId) return [];
      
      // First, get company contacts
      const { data: companyContacts, error: contactsError } = await supabase
        .from('company_contacts')
        .select('id, user_id, position')
        .eq('company_id', contactCompanyId);
      
      if (contactsError) throw contactsError;
      if (!companyContacts || companyContacts.length === 0) return [];
      
      // Then get profile information for each contact
      const userIds = companyContacts.map(contact => contact.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Combine the data
      return companyContacts.map(contact => {
        const profile = profiles?.find(p => p.id === contact.user_id);
        return {
          id: contact.id,
          user_id: contact.user_id,
          position: contact.position,
          first_name: profile?.first_name,
          last_name: profile?.last_name,
          avatar_url: profile?.avatar_url
        };
      });
    },
    enabled: !!contactCompanyId,
  });

  // Function to get the parent company name for display
  const { data: parentCompany } = useQuery({
    queryKey: ['parent-company', formData.company?.parent_id],
    queryFn: async () => {
      if (!formData.company?.parent_id) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('name')
        .eq('id', formData.company.parent_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!formData.company?.parent_id,
  });

  if (!formData.company) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please select a company first</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Contact</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isSubsidiary && parentCompany ? (
            <>Choose the contact from {parentCompany.name} (parent company) who will sign this contract for {formData.company.name}</>
          ) : (
            <>Choose the contact from {formData.company.name} who will sign this contract</>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {isSubsidiary && parentCompany ? 
              `No contacts found for the parent company ${parentCompany.name}` : 
              'No contacts found for this company'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map(contact => {
            const isSelected = formData.contact?.id === contact.id;
            const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown';
            
            return (
              <Card 
                key={contact.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary border-primary' : ''
                }`}
                onClick={() => setFormData({ ...formData, contact })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <UserAvatarGroup 
                      users={[{
                        id: contact.user_id,
                        first_name: contact.first_name || '',
                        last_name: contact.last_name || '',
                        avatar_url: contact.avatar_url
                      }]}
                      size="md"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{fullName}</p>
                      {contact.position && (
                        <p className="text-sm text-muted-foreground">{contact.position}</p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
