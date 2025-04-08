
import { useTranslation } from '@/hooks/useTranslation';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { InviteUserFormValues } from '@/schemas/userSchemas';

interface UserRoleSelectProps {
  form: UseFormReturn<InviteUserFormValues>;
}

export function UserRoleSelect({ form }: UserRoleSelectProps) {
  const t = useTranslation();
  
  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('Role')}</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="admin">{t('Admin')}</SelectItem>
              <SelectItem value="employee">{t('Employee')}</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
