
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { EmployeeFormData } from "@/types/employee";

const EMPLOYEE_TYPES = [
  { value: "Employee", label: "Employee" },
  { value: "Freelancer", label: "Freelancer" },
];

const TEAM_OPTIONS = [
  { value: "advisor", label: "Advisor" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "designer", label: "Designer" },
  { value: "advertiser", label: "Advertiser" },
];

export function EmploymentDetailsStep() {
  const form = useFormContext<EmployeeFormData>();
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="employeeType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Employee Type</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EMPLOYEE_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="team"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Team</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TEAM_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="hourlySalary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hourly Rate (NOK)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="0" 
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="employedPercentage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Employment Percentage</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="100" 
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value))} 
              />
            </FormControl>
            <FormDescription>
              Employment percentage (e.g. 100 for full-time)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
