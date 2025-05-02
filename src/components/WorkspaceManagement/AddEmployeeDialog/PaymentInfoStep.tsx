
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface PaymentInfoStepProps {
  formData: {
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    zipcode: string;
    country: string;
    city: string;
    employee_type: "Employee" | "Freelancer";
    hourly_salary: number;
    employed_percentage: number;
    social_security_number: string;
    account_number: string;
    paycheck_solution: string;
    team: string; // Include team field
  };
  onBack: () => void;
  onClose: () => void;
  isEdit?: boolean;
  employeeId?: string;
}

export function PaymentInfoStep({
  formData,
  onBack,
  onClose,
  isEdit = false,
  employeeId,
}: PaymentInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const schema = z.object({
      social_security_number: z.string().min(1, "Social security number is required"),
      account_number: z.string().min(1, "Account number is required"),
      paycheck_solution: z.string().min(1, "Paycheck solution is required"),
    });

    try {
      schema.parse({
        social_security_number: formData.social_security_number,
        account_number: formData.account_number,
        paycheck_solution: formData.paycheck_solution,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEdit && employeeId) {
        // Update existing employee
        const employeeData = {
          address: formData.address,
          zipcode: formData.zipcode,
          country: formData.country,
          city: formData.city,
          employee_type: formData.employee_type,
          hourly_salary: formData.hourly_salary,
          employed_percentage: formData.employed_percentage,
          social_security_number: formData.social_security_number,
          account_number: formData.account_number,
          paycheck_solution: formData.paycheck_solution,
        };

        const profileData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          team: formData.team, // Include team in profile update
        };

        // Update employee table
        const { error: employeeError } = await supabase
          .from("employees")
          .update(employeeData)
          .eq("id", employeeId);

        if (employeeError) {
          throw employeeError;
        }

        // Update profile table
        const { error: profileError } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", employeeId);

        if (profileError) {
          throw profileError;
        }

        toast.success("Employee updated successfully");
      } else {
        // Create new employee with the Supabase Edge function
        const response = await supabase.functions.invoke("user-management", {
          body: {
            action: "invite",
            email: formData.email,
            userMeta: {
              first_name: formData.first_name,
              last_name: formData.last_name,
              phone_number: formData.phone_number,
              role: "employee",
              team: formData.team, // Include team in user metadata
            },
            employeeData: {
              address: formData.address,
              zipcode: formData.zipcode,
              country: formData.country,
              city: formData.city,
              employee_type: formData.employee_type,
              hourly_salary: formData.hourly_salary,
              employed_percentage: formData.employed_percentage,
              social_security_number: formData.social_security_number,
              account_number: formData.account_number,
              paycheck_solution: formData.paycheck_solution,
            },
          },
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        toast.success("Employee invitation sent successfully");
      }

      onClose();
      // Refresh the page to show the new employee
      navigate(0);
    } catch (error: any) {
      console.error("Error creating/updating employee:", error);
      toast.error(error.message || "Failed to save employee information");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Payment Information</h3>
        <p className="text-sm text-muted-foreground">
          Enter the employee's payment details.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="social_security_number">Social Security Number</Label>
          <Input
            id="social_security_number"
            value={formData.social_security_number}
            onChange={(e) =>
              // This is just updating the local state, not sending to API yet
              onBack({ social_security_number: e.target.value })
            }
            placeholder="Social security number"
          />
          {errors.social_security_number && (
            <p className="text-sm text-red-500">{errors.social_security_number}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="account_number">Account Number</Label>
          <Input
            id="account_number"
            value={formData.account_number}
            onChange={(e) =>
              // This is just updating the local state, not sending to API yet
              onBack({ account_number: e.target.value })
            }
            placeholder="Bank account number"
          />
          {errors.account_number && (
            <p className="text-sm text-red-500">{errors.account_number}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="paycheck_solution">Paycheck Solution</Label>
          <Input
            id="paycheck_solution"
            value={formData.paycheck_solution}
            onChange={(e) =>
              // This is just updating the local state, not sending to API yet
              onBack({ paycheck_solution: e.target.value })
            }
            placeholder="Paycheck solution (e.g., direct deposit)"
          />
          {errors.paycheck_solution && (
            <p className="text-sm text-red-500">{errors.paycheck_solution}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEdit ? "Update Employee" : "Create Employee"}
        </Button>
      </div>
    </div>
  );
}
