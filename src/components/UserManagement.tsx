
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@/hooks/useTranslation';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { inviteUserSchema, InviteUserFormValues } from '@/schemas/userSchemas';
import { useInviteUser } from '@/hooks/useInviteUser';
import { UserContactFields } from './UserManagement/UserContactFields';
import { UserRoleSelect } from './UserManagement/UserRoleSelect';
import { TeamSelect } from './UserManagement/TeamSelect';
import { LanguageSelect } from './UserManagement/LanguageSelect';

interface UserManagementProps {
  onSuccess?: () => void;
}

export function UserManagement({ onSuccess }: UserManagementProps) {
  const t = useTranslation();
  
  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: '',
      displayName: '',
      role: 'employee',
      team: 'Client Services',
      language: 'en',
    },
  });

  const inviteUserMutation = useInviteUser({
    onSuccess: () => {
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    }
  });

  const onSubmit = (data: InviteUserFormValues) => {
    inviteUserMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <UserContactFields form={form} />
        <UserRoleSelect form={form} />
        <TeamSelect form={form} />
        <LanguageSelect form={form} />
        
        <Button 
          type="submit" 
          className="w-full mt-4 bg-blue-500 hover:bg-blue-600" 
          disabled={inviteUserMutation.isPending}
        >
          {inviteUserMutation.isPending ? t('Sending...') : t('Send Invitation')}
        </Button>
      </form>
    </Form>
  );
}
