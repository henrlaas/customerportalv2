
import { useTranslation } from '@/hooks/useTranslation';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { InviteUserFormValues } from '@/schemas/userSchemas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectProps {
  form: UseFormReturn<InviteUserFormValues>;
}

export function LanguageSelect({ form }: LanguageSelectProps) {
  const t = useTranslation();
  
  return (
    <FormField
      control={form.control}
      name="language"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Language</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="en">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🇺🇸</span>
                  <span>English</span>
                </div>
              </SelectItem>
              <SelectItem value="no">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🇳🇴</span>
                  <span>Norwegian</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
