
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
import { CompanyFormValues } from './types';
import { AdvisorSelect } from './AdvisorSelect';
import CountrySelector from '@/components/ui/CountrySelector/selector';
import { COUNTRIES } from '@/components/ui/CountrySelector/countries';
import React, { useState } from 'react';

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
  // Find Norway in the countries list to set as default
  const norwayOption = COUNTRIES.find(country => country.value === 'NO') || COUNTRIES[0];
  const [countryOpen, setCountryOpen] = useState(false);

  // Set Norway as default country when form loads
  React.useEffect(() => {
    const currentCountry = form.getValues('country');
    if (!currentCountry) {
      form.setValue('country', norwayOption.title);
    }
  }, [form, norwayOption.title]);

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
            render={({ field }) => {
              const selectedCountry = COUNTRIES.find(country => country.title === field.value) || norwayOption;
              
              return (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <CountrySelector
                      id="country-selector"
                      open={countryOpen}
                      onToggle={() => setCountryOpen(!countryOpen)}
                      selectedValue={selectedCountry}
                      onChange={(countryCode) => {
                        const country = COUNTRIES.find(c => c.value === countryCode);
                        if (country) {
                          field.onChange(country.title);
                        }
                        setCountryOpen(false);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
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
              <FormControl>
                <AdvisorSelect
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
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
                    min="0"
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
