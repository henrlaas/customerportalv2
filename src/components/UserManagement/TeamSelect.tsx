
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
import { InviteFormValues } from '@/schemas/userSchemas';

interface TeamSelectProps {
  form: UseFormReturn<InviteFormValues>;
}

export function TeamSelect({ form }: TeamSelectProps) {
  const t = useTranslation();
  
  return (
    <FormField
      control={form.control}
      name="team"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('Team')}</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Executive Team">{t('Executive Team')}</SelectItem>
              <SelectItem value="Creative Team">{t('Creative Team')}</SelectItem>
              <SelectItem value="Client Services">{t('Client Services')}</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
