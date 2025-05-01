
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { EmployeeFormData } from "@/types/employee";
import { Eye, EyeOff } from "lucide-react";

export function PaymentInfoStep() {
  const form = useFormContext<EmployeeFormData>();
  const [showSSN, setShowSSN] = useState(false);
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="socialSecurityNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Social Security Number</FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  type={showSSN ? "text" : "password"} 
                  placeholder="Social security number" 
                  {...field} 
                />
                <Button
                  type="button"
                  variant="ghost" 
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowSSN(!showSSN)}
                >
                  {showSSN ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="accountNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bank Account Number</FormLabel>
            <FormControl>
              <Input placeholder="Account number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="paycheckSolution"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Paycheck Solution</FormLabel>
            <FormControl>
              <Input placeholder="Paycheck solution" {...field} />
            </FormControl>
            <FormDescription>
              System used for paycheck handling
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
