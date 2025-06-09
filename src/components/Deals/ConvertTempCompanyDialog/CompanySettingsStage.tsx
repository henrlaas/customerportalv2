
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

  // Helper function to get user initials
  const getUserInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Custom option component for react-select with avatar
  const CustomOption = ({ data, ...props }: any) => (
    <div {...props.innerProps} className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer">
      <Avatar className="h-6 w-6">
        <AvatarImage src={data.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {getUserInitials(data.first_name, data.last_name)}
        </AvatarFallback>
      </Avatar>
      <span>{data.label}</span>
    </div>
  );

  // Custom single value component for react-select with avatar
  const CustomSingleValue = ({ data }: any) => (
    <div className="flex items-center gap-2">
      <Avatar className="h-5 w-5">
        <AvatarImage src={data.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {getUserInitials(data.first_name, data.last_name)}
        </AvatarFallback>
      </Avatar>
      <span>{data.label}</span>
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
                options={advisorOptions}
                value={selectedAdvisor || null}
                onChange={(option) => field.onChange(option ? option.value : '')}
                placeholder="Select an advisor"
                className="react-select-container"
                classNamePrefix="react-select"
                components={{
                  Option: CustomOption,
                  SingleValue: CustomSingleValue,
                }}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    borderColor: 'hsl(var(--input))',
                    backgroundColor: 'hsl(var(--background))',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: 'hsl(var(--input))'
                    },
                    minHeight: '44px',
                    height: '44px',
                    padding: '0 8px',
                  }),
                  valueContainer: (baseStyles) => ({
                    ...baseStyles,
                    height: '44px',
                    padding: '0 8px',
                    display: 'flex',
                    alignItems: 'center',
                  }),
                  input: (baseStyles) => ({
                    ...baseStyles,
                    color: 'hsl(var(--foreground))',
                    margin: 0,
                    padding: 0,
                  }),
                  placeholder: (baseStyles) => ({
                    ...baseStyles,
                    color: 'hsl(var(--muted-foreground))',
                    margin: 0,
                  }),
                  singleValue: (baseStyles) => ({
                    ...baseStyles,
                    color: 'hsl(var(--foreground))',
                    margin: 0,
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    zIndex: 50
                  }),
                  option: (baseStyles) => ({
                    ...baseStyles,
                    backgroundColor: 'transparent',
                    color: 'hsl(var(--foreground))',
                    padding: 0,
                  }),
                  indicatorsContainer: (baseStyles) => ({
                    ...baseStyles,
                    height: '44px',
                  }),
                }}
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
