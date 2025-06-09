
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CompanyFavicon } from '@/components/CompanyFavicon';

export function CompanyBasicInfoStage({ form }: { form: any }) {
  const website = form.watch('website');
  const companyName = form.watch('name');

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Company Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Review and edit the basic company information from the temporary company.
        </p>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
          <CompanyFavicon 
            companyName={companyName} 
            website={website}
            size="lg"
          />
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
    </div>
  );
}
