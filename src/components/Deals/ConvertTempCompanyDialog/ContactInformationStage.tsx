
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Input } from '@/components/ui/input';

export function ContactInformationStage({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Contact Information</h3>
        <p className="text-sm text-muted-foreground">
          Provide contact details for the company.
        </p>
      </div>

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number*</FormLabel>
            <FormControl>
              <PhoneInput
                country={'no'}
                value={field.value}
                onChange={field.onChange}
                inputClass="w-full h-10 px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                containerClass="w-full"
                buttonClass="border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-l-md"
                dropdownClass="bg-background border border-input shadow-md rounded-md"
                searchClass="bg-background border-b border-input"
                inputStyle={{
                  width: '100%',
                  paddingLeft: '48px',
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--input))',
                  color: 'hsl(var(--foreground))'
                }}
                buttonStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--input))'
                }}
              />
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
            <FormLabel>Invoice Email*</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="billing@company.com"
                {...field}
              />
            </FormControl>
            <FormDescription>Email address for sending invoices</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
