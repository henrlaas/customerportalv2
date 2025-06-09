
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export function ClientTypeAndMrrStage({ form }: { form: any }) {
  const clientTypes = form.watch('client_types') || [];

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Client Type & Revenue</h3>
        <p className="text-sm text-muted-foreground">
          Configure the client type and monthly recurring revenue.
        </p>
      </div>

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
                          if (checked) {
                            field.onChange([...current, 'marketing']);
                          } else {
                            field.onChange(current.filter((value: string) => value !== 'marketing'));
                          }
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
                          if (checked) {
                            field.onChange([...current, 'web']);
                          } else {
                            field.onChange(current.filter((value: string) => value !== 'web'));
                          }
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
