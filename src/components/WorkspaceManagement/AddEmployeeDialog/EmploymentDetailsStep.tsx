
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { toast } from "sonner";

interface EmploymentDetailsStepProps {
  formData: {
    employee_type: "Employee" | "Freelancer";
    hourly_salary: number;
    employed_percentage: number;
  };
  onUpdate: (data: Partial<typeof formData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function EmploymentDetailsStep({
  formData,
  onUpdate,
  onNext,
  onBack,
}: EmploymentDetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const schema = z.object({
      employee_type: z.enum(["Employee", "Freelancer"]),
      hourly_salary: z.number().min(0, "Hourly salary must be a positive number"),
      employed_percentage: z.number().min(1, "Employment percentage must be at least 1%").max(100, "Employment percentage cannot exceed 100%"),
    });

    try {
      schema.parse(formData);
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

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Employment Details</h3>
        <p className="text-sm text-muted-foreground">
          Enter the employee's employment details.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="employee_type">Employee Type</Label>
          <Select
            value={formData.employee_type}
            onValueChange={(value) => onUpdate({ employee_type: value as "Employee" | "Freelancer" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select employee type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Employee">Employee</SelectItem>
              <SelectItem value="Freelancer">Freelancer</SelectItem>
            </SelectContent>
          </Select>
          {errors.employee_type && (
            <p className="text-sm text-red-500">{errors.employee_type}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="hourly_salary">Hourly Salary (NOK)</Label>
          <Input
            id="hourly_salary"
            type="number"
            value={formData.hourly_salary}
            onChange={(e) => onUpdate({ hourly_salary: Number(e.target.value) })}
            placeholder="0"
          />
          {errors.hourly_salary && (
            <p className="text-sm text-red-500">{errors.hourly_salary}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="employed_percentage">Employment Percentage</Label>
          <Input
            id="employed_percentage"
            type="number"
            value={formData.employed_percentage}
            onChange={(e) => onUpdate({ employed_percentage: Number(e.target.value) })}
            placeholder="100"
            min="1"
            max="100"
          />
          {errors.employed_percentage && (
            <p className="text-sm text-red-500">{errors.employed_percentage}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
}
