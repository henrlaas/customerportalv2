import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MultiUserSelect } from "@/components/Projects/MultiUserSelect";
import { useCreateMilestone } from "@/hooks/useCreateMilestone";
import Select from "react-select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { useCompanyList } from "@/hooks/useCompanyList";

// Define the form schema
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  company_id: z.string().min(1, "Company is required"),
  value: z.coerce.number().min(0, "Value must be a positive number"),
  price_type: z.enum(["fixed", "estimated"]),
  deadline: z.date().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectCreateDialog = ({ isOpen, onClose }: ProjectCreateDialogProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showSubsidiaries, setShowSubsidiaries] = useState(false);
  const { profile } = useAuth();
  const { createMilestone } = useCreateMilestone();
  const { companies = [], isLoading: companiesLoading } = useCompanyList(showSubsidiaries);
  
  const totalSteps = 2; // Total number of steps in the form
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      value: 0,
      price_type: "fixed",
    },
  });
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, control } = form;
  
  const handleUsersChange = (userIds: string[]) => {
    setSelectedUserIds(userIds);
  };

  const onSubmit = async (data: ProjectFormValues) => {
    if (!profile) return;
    setIsSubmitting(true);
    
    try {
      // Create project in Supabase
      const { data: projectData, error } = await supabase
        .from('projects')
        .insert({
          name: data.name,
          description: data.description || null,
          company_id: data.company_id,
          value: data.value,
          price_type: data.price_type,
          deadline: data.deadline ? data.deadline.toISOString() : null,
          created_by: profile.id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating project:', error);
        toast.error("Failed to create project");
        return;
      }
      
      // Create initial milestone (Started) - changed from Created to Started
      await createMilestone({
        projectId: projectData.id,
        name: "Started",
        status: "created",
      });
      
      // Create final milestone (Finished)
      await createMilestone({
        projectId: projectData.id,
        name: "Finished",
        status: "created",
      });
      
      // Add assignees if selected
      if (selectedUserIds.length > 0) {
        const assigneeInserts = selectedUserIds.map(userId => ({
          project_id: projectData.id,
          user_id: userId
        }));
        
        const { error: assigneeError } = await supabase
          .from('project_assignees')
          .insert(assigneeInserts);
        
        if (assigneeError) {
          console.error('Error assigning users to project:', assigneeError);
        }
      }
      
      toast.success("Project created successfully");
      onClose();
      
      // Reload page to show new project
      window.location.reload();
    } catch (error) {
      console.error('Error in project creation:', error);
      toast.error("An error occurred while creating the project");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const nextStep = () => {
    if (step === 1) {
      // Validate the first step fields
      form.trigger(['name', 'company_id', 'price_type', 'value']).then(isValid => {
        if (isValid) {
          setStep(2);
        }
      });
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleDialogClose = () => {
    // Reset form on close
    form.reset();
    setStep(1);
    setSelectedUserIds([]);
    onClose();
  };
  
  // Format companies for react-select
  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name,
    isSubsidiary: !!company.parent_id
  }));

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Project</DialogTitle>
        </DialogHeader>
        
        <ProgressStepper currentStep={step} totalSteps={totalSteps} />
        
        {/* Important: Wrap each step in its own div and don't use handleSubmit here */}
        <div className="space-y-4">
          {/* Step 1: Basic Project Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter project name" 
                  {...register("name")} 
                  className="w-full"
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company_id">Company</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-subsidiaries"
                      checked={showSubsidiaries}
                      onCheckedChange={(checked) => setShowSubsidiaries(!!checked)}
                    />
                    <Label htmlFor="show-subsidiaries" className="text-sm cursor-pointer">
                      Show subsidiaries
                    </Label>
                  </div>
                  
                  <Select
                    className="react-select-container"
                    classNamePrefix="react-select"
                    options={companyOptions}
                    isLoading={companiesLoading}
                    placeholder="Select a company"
                    onChange={(option) => option && setValue("company_id", option.value)}
                    formatOptionLabel={({ label, isSubsidiary }) => (
                      <div>
                        {isSubsidiary && <span className="text-muted-foreground">↳ </span>}
                        {label}
                      </div>
                    )}
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: 'var(--radius)',
                        borderColor: 'hsl(var(--input))',
                        '&:hover': {
                          borderColor: 'hsl(var(--input))'
                        },
                        boxShadow: 'none',
                        padding: '2px'
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: 'var(--radius)',
                        overflow: 'hidden',
                        zIndex: 50
                      })
                    }}
                  />
                </div>
                {errors.company_id && <p className="text-sm text-red-500">{errors.company_id.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label>Price Type</Label>
                <RadioGroup
                  defaultValue="fixed"
                  className="flex gap-6"
                  onValueChange={(value) => setValue("price_type", value as "fixed" | "estimated")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="cursor-pointer">Fixed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="estimated" id="estimated" />
                    <Label htmlFor="estimated" className="cursor-pointer">Estimated</Label>
                  </div>
                </RadioGroup>
                {errors.price_type && <p className="text-sm text-red-500">{errors.price_type.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="value">Project Value (NOK)</Label>
                <Input 
                  id="value" 
                  type="number" 
                  placeholder="0" 
                  {...register("value")} 
                  className="w-full"
                />
                {errors.value && <p className="text-sm text-red-500">{errors.value.message}</p>}
              </div>
            </div>
          )}
          
          {/* Step 2: Additional Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  className="min-h-[120px]" 
                  placeholder="Project description..." 
                  {...register("description")} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watch("deadline") && "text-muted-foreground"
                      )}
                      type="button"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch("deadline") ? 
                        format(watch("deadline"), "PP") : 
                        "Select deadline date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watch("deadline")}
                      onSelect={(date) => setValue("deadline", date || undefined)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Assign Team Members</Label>
                <MultiUserSelect 
                  selectedUserIds={selectedUserIds}
                  onChange={handleUsersChange}
                  placeholder="Select team members for this project"
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6 gap-2">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
            {step === 1 ? (
              <Button 
                type="button" 
                onClick={nextStep} 
                className="bg-evergreen hover:bg-evergreen/90"
              >
                Next
              </Button>
            ) : (
              <Button 
                type="button"
                onClick={handleSubmit(onSubmit)} 
                disabled={isSubmitting} 
                className="bg-evergreen hover:bg-evergreen/90"
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
