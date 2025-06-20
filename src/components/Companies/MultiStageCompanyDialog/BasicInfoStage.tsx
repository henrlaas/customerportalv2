
import { Building } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CLIENT_TYPES } from './ClientTypes';

export function BasicInfoStage({
  form,
  logo
}: {
  form: any;
  logo: string | null;
}) {
  const clientTypes = form.watch('client_types');
  
  return (
    <>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
          {logo ? <img src={logo} alt="Company Logo" className="h-12 w-12 object-contain" /> : <Building className="h-8 w-8 text-gray-400" />}
        </div>
        <div className="flex-1">
          <FormField control={form.control} name="name" render={({
          field
        }: any) => <FormItem>
                <FormLabel>Company Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Corporation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />
        </div>
      </div>
      
      <FormField control={form.control} name="organization_number" render={({
      field
    }: any) => <FormItem>
            <FormLabel>Organization Number*</FormLabel>
            <FormControl>
              <Input placeholder="123456-7890" {...field} />
            </FormControl>
            <FormDescription>
              Official registration number of the company
            </FormDescription>
            <FormMessage />
          </FormItem>} />
      
      <FormField control={form.control} name="client_types" render={() => <FormItem>
            <div className="mb-2">
              <FormLabel>Client Type*</FormLabel>
              <FormDescription>
                Type of services provided to this client
              </FormDescription>
            </div>
            <div className="space-y-2">
              <FormField control={form.control} name="client_types" render={({
          field
        }: any) => <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value?.includes(CLIENT_TYPES.MARKETING)} onCheckedChange={checked => {
              const current = field.value || [];
              const updated = checked ? [...current, CLIENT_TYPES.MARKETING] : current.filter((value: string) => value !== CLIENT_TYPES.MARKETING);
              field.onChange(updated.length > 0 ? updated : current);
            }} />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Marketing</FormLabel>
                  </FormItem>} />
              <FormField control={form.control} name="client_types" render={({
          field
        }: any) => <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value?.includes(CLIENT_TYPES.WEB)} onCheckedChange={checked => {
              const current = field.value || [];
              const updated = checked ? [...current, CLIENT_TYPES.WEB] : current.filter((value: string) => value !== CLIENT_TYPES.WEB);
              field.onChange(updated.length > 0 ? updated : current);
            }} />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Web</FormLabel>
                  </FormItem>} />
            </div>
            <FormMessage />
          </FormItem>} />
    </>
  );
}
