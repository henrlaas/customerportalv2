
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import CountrySelector from '@/components/ui/CountrySelector/selector';
import { COUNTRIES } from '@/components/ui/CountrySelector/countries';
import { useState } from 'react';

export function AddressInformationStage({ form }: { form: any }) {
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
  
  const selectedCountryCode = form.watch('country') || 'NO';
  const selectedCountry = COUNTRIES.find(country => country.value === selectedCountryCode) || COUNTRIES.find(country => country.value === 'NO')!;

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Company Address</h3>
        <p className="text-sm text-muted-foreground">
          Provide the complete address for the company.
        </p>
      </div>

      <FormField
        control={form.control}
        name="street_address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address*</FormLabel>
            <FormControl>
              <Input placeholder="Street address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code*</FormLabel>
              <FormControl>
                <Input placeholder="1234" {...field} />
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
              <FormLabel>City*</FormLabel>
              <FormControl>
                <Input placeholder="Oslo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <CountrySelector
                id="country-selector"
                open={isCountrySelectorOpen}
                onToggle={() => setIsCountrySelectorOpen(!isCountrySelectorOpen)}
                selectedValue={selectedCountry}
                onChange={(value) => {
                  field.onChange(value);
                  setIsCountrySelectorOpen(false);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
