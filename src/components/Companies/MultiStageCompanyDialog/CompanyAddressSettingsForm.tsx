import { MapPin, User } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CompanyFormValues } from './types';
import React from 'react';

interface CompanyAddressSettingsFormProps {
  form: UseFormReturn<CompanyFormValues>;
  users: any[];
  hasMarketingType: boolean;
}

export const CompanyAddressSettingsForm = ({ 
  form, 
  users, 
  hasMarketingType 
}: CompanyAddressSettingsFormProps) => {
  // Set Norway as default country when form loads
  React.useEffect(() => {
    form.setValue('country', 'Norge');
  }, []);

  return (
    <>
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="text-sm font-medium flex items-center mb-2 gap-2">
          <MapPin className="h-4 w-4" /> Address Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="street_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Oslo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="0123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2 h-10 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm">
                    🇳🇴 Norge
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="advisor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <User className="h-4 w-4" /> Advisor
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an advisor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Employee responsible for this client
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {hasMarketingType && (
          <FormField
            control={form.control}
            name="mrr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Recurring Revenue</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="1000"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormDescription>
                  Monthly price charged to the client
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
      
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="trial_period"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Trial Period</FormLabel>
                <FormDescription>
                  Provide 30 days free trial
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="is_partner"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Partner Company</FormLabel>
                <FormDescription>
                  Can have subsidiaries
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
