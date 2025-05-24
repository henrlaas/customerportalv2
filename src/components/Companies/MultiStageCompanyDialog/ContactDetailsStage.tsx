
import { Globe, Phone, Mail } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
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
              <PhoneInput
                country={'no'}
                value={field.value}
                onChange={field.onChange}
                inputStyle={{
                  width: '100%',
                  height: '40px',
                  fontSize: '14px',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  paddingLeft: '48px',
                  backgroundColor: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                }}
                buttonStyle={{
                  border: '1px solid hsl(var(--border))',
                  borderRight: 'none',
                  borderRadius: '6px 0 0 6px',
                  backgroundColor: 'hsl(var(--background))',
                }}
                dropdownStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  zIndex: 50,
                }}
                searchStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '4px',
                  color: 'hsl(var(--foreground))',
                }}
                placeholder="Enter phone number"
              />
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
