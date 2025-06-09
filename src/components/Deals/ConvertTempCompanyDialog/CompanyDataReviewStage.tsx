
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Building } from 'lucide-react';

export function CompanyDataReviewStage({ form }: { form: any }) {
  const clientTypes = form.watch('client_types');

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Review Pre-filled Company Information</h3>
        <p className="text-sm text-muted-foreground">
          This information was collected from the temporary company. Please review and make any necessary changes.
        </p>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
          <Building className="h-8 w-8 text-gray-400" />
        </div>
        <div className="flex-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={form.control}
        name="organization_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Organization Number*</FormLabel>
            <FormControl>
              <Input placeholder="123456789" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website*</FormLabel>
            <FormControl>
              <Input placeholder="https://company.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number*</FormLabel>
            <FormControl>
              <Input placeholder="+47 123 45 678" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="client_types"
        render={() => (
          <FormItem>
            <div className="mb-2">
              <FormLabel>Client Type*</FormLabel>
              <FormDescription>Type of services provided to this client</FormDescription>
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="client_types"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes('marketing')}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          const updated = checked
                            ? [...current, 'marketing']
                            : current.filter((value: string) => value !== 'marketing');
                          field.onChange(updated.length > 0 ? updated : current);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Marketing</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="client_types"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes('web')}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          const updated = checked
                            ? [...current, 'web']
                            : current.filter((value: string) => value !== 'web');
                          field.onChange(updated.length > 0 ? updated : current);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Web</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {clientTypes?.includes('marketing') && (
        <FormField
          control={form.control}
          name="mrr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Recurring Revenue (MRR)*</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>Monthly recurring revenue in NOK</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
