
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContractTitleContactStageProps {
  form: UseFormReturn<any>;
  companyContacts: any[];
  isLoadingContacts: boolean;
}

export function ContractTitleContactStage({ 
  form, 
  companyContacts, 
  isLoadingContacts 
}: ContractTitleContactStageProps) {
  const selectedContactId = form.watch('contact_id');

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contract Title</FormLabel>
            <FormControl>
              <Input 
                placeholder="Project Agreement - Company Name" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contact_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select Company Contact</FormLabel>
            <FormControl>
              <div className="space-y-3">
                {isLoadingContacts ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading contacts...
                  </div>
                ) : companyContacts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No contacts found for this company
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {companyContacts.map((contact) => (
                      <Card
                        key={contact.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          selectedContactId === contact.id
                            ? "ring-2 ring-primary border-primary"
                            : "hover:border-muted-foreground"
                        )}
                        onClick={() => field.onChange(contact.id)}
                      >
                        <CardContent className="flex items-center gap-3 p-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={contact.profiles?.avatar_url || undefined} />
                            <AvatarFallback>
                              {contact.profiles?.first_name?.[0] || ''}
                              {contact.profiles?.last_name?.[0] || ''}
                              {!contact.profiles?.first_name && !contact.profiles?.last_name && (
                                <User className="h-4 w-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">
                              {contact.profiles?.first_name || ''} {contact.profiles?.last_name || ''}
                            </div>
                            {contact.position && (
                              <div className="text-sm text-muted-foreground">
                                {contact.position}
                              </div>
                            )}
                          </div>
                          {selectedContactId === contact.id && (
                            <div className="text-primary">
                              <svg
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
