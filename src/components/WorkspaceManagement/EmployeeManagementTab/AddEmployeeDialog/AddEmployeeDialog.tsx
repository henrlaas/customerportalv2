
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { employeeService } from "@/services/employeeService";
import { EmployeeFormData } from "@/types/employee";
import Steps from "./Steps";
import { BasicInfoStep } from "./BasicInfoStep";
import { EmploymentDetailsStep } from "./EmploymentDetailsStep";
import { PaymentInfoStep } from "./PaymentInfoStep";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const employeeFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zipcode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  employeeType: z.enum(["Employee", "Freelancer"]),
  team: z.string().min(1, "Team is required"),
  hourlySalary: z.number().min(1, "Hourly rate is required"),
  employedPercentage: z.number().min(1, "Employment percentage is required"),
  socialSecurityNumber: z.string().min(1, "Social security number is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  paycheckSolution: z.string().min(1, "Paycheck solution is required"),
});

export function AddEmployeeDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddEmployeeDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "+47",
      address: "",
      city: "",
      zipcode: "",
      country: "Norway",
      employeeType: "Employee",
      team: "",
      hourlySalary: 0,
      employedPercentage: 100,
      socialSecurityNumber: "",
      accountNumber: "",
      paycheckSolution: "",
    },
  });
  
  const createEmployeeMutation = useMutation({
    mutationFn: employeeService.createEmployee,
    onSuccess: (data) => {
      if (data.isExisting) {
        toast({
          title: "User already exists",
          description: "This email is already registered as an employee.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Employee created",
          description: "The employee has been successfully created.",
        });
        form.reset();
        setCurrentStep(0);
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create employee: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleNext = async () => {
    const fieldsToValidate = currentStep === 0
      ? ["firstName", "lastName", "email", "phone", "address", "city", "zipcode", "country"]
      : currentStep === 1
      ? ["employeeType", "team", "hourlySalary", "employedPercentage"]
      : ["socialSecurityNumber", "accountNumber", "paycheckSolution"];
    
    const isValid = await form.trigger(fieldsToValidate as any);
    
    if (isValid) {
      if (currentStep < Steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        const formData = form.getValues();
        createEmployeeMutation.mutate(formData);
      }
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const progressPercentage = ((currentStep + 1) / Steps.length) * 100;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{Steps[currentStep].title}</DialogTitle>
          <DialogDescription className="text-center">
            {Steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>
        
        <Progress value={progressPercentage} className="h-2" />
        
        <div className="py-4">
          <FormProvider {...form}>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {currentStep === 0 && <BasicInfoStep />}
              {currentStep === 1 && <EmploymentDetailsStep />}
              {currentStep === 2 && <PaymentInfoStep />}
            </form>
          </FormProvider>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={createEmployeeMutation.isPending}
          >
            {currentStep === Steps.length - 1 ? (
              createEmployeeMutation.isPending ? "Creating..." : "Create Employee"
            ) : (
              "Next"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
