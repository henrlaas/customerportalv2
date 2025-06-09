
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Select from 'react-select';
import { AdvisorOption } from './types';

interface CompanySettingsStageProps {
  form: any;
  advisorOptions: AdvisorOption[];
}

export function CompanySettingsStage({ form, advisorOptions }: CompanySettingsStageProps) {
  const selectedAdvisorId = form.watch('advisor_id');
  const selectedAdvisor = advisorOptions.find(option => option.value === selectedAdvisorId);

  const formatOptionLabel = (option: AdvisorOption) => (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={option.avatar_url} alt={option.label} />
        <AvatarFallback className="text-xs">
          {option.first_name?.[0]}{option.last_name?.[0]}
        </AvatarFallback>
      </Avatar>
      <span>{option.label}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Company Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure additional company settings and assign an advisor.
        </p>
      </div>

      <FormField
        control={form.control}
        name="advisor_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assigned Advisor*</FormLabel>
            <FormControl>
              <Select
                value={selectedAdvisor}
                onChange={(option) => field.onChange(option?.value || '')}
                options={advisorOptions}
                formatOptionLabel={formatOptionLabel}
                placeholder="Select an advisor"
                isClearable={false}
                className="text-sm"
                classNamePrefix="react-select"
              />
            </FormControl>
            <FormDescription>Select the advisor responsible for this company</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="trial_period"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Trial Period</FormLabel>
              <FormDescription>
                This company is currently in a trial period
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_partner"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Partner Company</FormLabel>
              <FormDescription>
                This company is a business partner
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
