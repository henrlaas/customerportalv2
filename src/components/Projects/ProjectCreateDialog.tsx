import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, ChevronRight } from "lucide-react";
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
import { useCompanyNames } from "@/hooks/useCompanyNames";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MultiUserSelect } from "@/components/Projects/MultiUserSelect";
import { useCreateMilestone } from "@/hooks/useCreateMilestone";

// Define the form schema
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  company_id: z.string().min(1, "Company is required"),
  value: z.coerce.number().min(0, "Value must be a positive number"),
  price_type: z.enum(["fixed", "hourly"]),
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
  const { profile } = useAuth();
  const { data: companies = [], isLoading: companiesLoading } = useCompanyNames();
  const { createMilestone } = useCreateMilestone();
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      value: 0,
      price_type: "fixed",
    },
  });
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;
  
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
      
      // Create initial milestone (Created)
      await createMilestone({
        projectId: projectData.id,
        name: "Created",
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
      const basicInfoValid = form.trigger(['name', 'company_id', 'price_type', 'value']);
      if (basicInfoValid) {
        setStep(2);
      }
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

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Basic Project Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="company_id">Company</Label>
                <select
                  id="company_id"
                  className="w-full p-2 border rounded"
                  {...register("company_id")}
                  disabled={companiesLoading}
                >
                  <option value="">Select a company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                {errors.company_id && <p className="text-sm text-red-500">{errors.company_id.message}</p>}
              </div>
              
              <div>
                <Label>Price Type</Label>
                <RadioGroup
                  defaultValue="fixed"
                  className="flex gap-4"
                  onValueChange={(value) => setValue("price_type", value as "fixed" | "hourly")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed">Fixed Price</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hourly" id="hourly" />
                    <Label htmlFor="hourly">Hourly</Label>
                  </div>
                </RadioGroup>
                {errors.price_type && <p className="text-sm text-red-500">{errors.price_type.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="value">Project Value (NOK)</Label>
                <Input id="value" type="number" {...register("value")} />
                {errors.value && <p className="text-sm text-red-500">{errors.value.message}</p>}
              </div>
            </div>
          )}
          
          {/* Step 2: Additional Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  className="min-h-[120px]" 
                  placeholder="Project description..." 
                  {...register("description")} 
                />
              </div>
              
              <div>
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watch("deadline") && "text-muted-foreground"
                      )}
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
              
              <div>
                <Label>Assign Team Members (Optional)</Label>
                <MultiUserSelect 
                  selectedUserIds={selectedUserIds}
                  onChange={handleUsersChange}
                  placeholder="Select team members for this project"
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
            )}
            {step === 1 ? (
              <Button type="button" onClick={nextStep}>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
