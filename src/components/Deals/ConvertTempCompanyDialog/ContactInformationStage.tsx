
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { PhoneInput } from '@/components/ui/phone-input';
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
                value={field.value}
                onChange={field.onChange}
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
