
import { Globe, Phone, Mail } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function ContactDetailsStage({ form }: { form: any }) {
  return (
    <>
      <FormField
        control={form.control}
        name="website"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> Website
            </FormLabel>
            <FormControl>
              <Input placeholder="https://example.com" {...field} />
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
        render={({ field }: any) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Phone Number
            </FormLabel>
            <FormControl>
              <Input placeholder="+1 (555) 123-4567" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="invoice_email"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Invoice Email
            </FormLabel>
            <FormControl>
              <Input placeholder="invoices@example.com" {...field} />
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
}
