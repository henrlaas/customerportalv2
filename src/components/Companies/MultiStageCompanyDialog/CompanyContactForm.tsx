
import { Globe, Phone, Mail } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { CompanyFormValues } from './types';

interface CompanyContactFormProps {
  form: UseFormReturn<CompanyFormValues>;
}

export const CompanyContactForm = ({ form }: CompanyContactFormProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> Website*
            </FormLabel>
            <FormControl>
              <Input placeholder="https://example.com" {...field} required />
            </FormControl>
            <FormDescription>
              Company website (logo will be automatically fetched)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Phone Number*
            </FormLabel>
            <FormControl>
              <PhoneInput {...field} required />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="invoice_email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Invoice Email*
            </FormLabel>
            <FormControl>
              <Input placeholder="invoices@example.com" {...field} required />
            </FormControl>
            <FormDescription>
              Email address for sending invoices
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
