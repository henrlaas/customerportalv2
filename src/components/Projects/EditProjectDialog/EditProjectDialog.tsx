
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Calculator, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Select from "react-select";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { useCompanyList } from "@/hooks/useCompanyList";
import { CompanyFavicon } from "@/components/CompanyFavicon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { ProjectWithRelations } from '@/hooks/useProjects';
import { ProjectAssignee } from '@/hooks/useProjectAssignees';

// Define the form schema with updated validation
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Project description is required"),
  company_id: z.string().min(1, "Company is required"),
  value: z.coerce.number().min(0, "Value must be 0 or higher"),
  price_type: z.enum(["fixed", "estimated"]),
  deadline: z.date().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

type User = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
  role: string;
};

interface EditProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectFormValues & { assignees?: string[] }) => void;
  project: ProjectWithRelations;
  assignees: ProjectAssignee[];
  isLoading: boolean;
}

export const EditProjectDialog = ({ isOpen, onClose, onSave, project, assignees, isLoading }: EditProjectDialogProps) => {
  const [step, setStep] = useState(1);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const { companies = [], isLoading: companiesLoading } = useCompanyList(true); // Always show subsidiaries
  
  const totalSteps = 2;
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project.name,
      description: project.description || '',
      company_id: project.company_id,
      value: project.value || 0,
      price_type: (project.price_type as "fixed" | "estimated") || "fixed",
      deadline: project.deadline ? new Date(project.deadline) : undefined,
    },
  });
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, control } = form;

  // Fetch users with admin or employee roles
  const { data: users = [] } = useQuery({
    queryKey: ['users-for-project-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, role')
        .in('role', ['admin', 'employee']);
        
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      return data as User[];
    }
  });

  // Reset form and selected users when project or assignees change
  useEffect(() => {
    if (project && assignees) {
      form.reset({
        name: project.name,
        description: project.description || '',
        company_id: project.company_id,
        value: project.value || 0,
        price_type: (project.price_type as "fixed" | "estimated") || "fixed",
        deadline: project.deadline ? new Date(project.deadline) : undefined,
      });
      setSelectedUserIds(assignees.map(assignee => assignee.user_id));
    }
  }, [project, assignees, form]);
  
  const handleUsersChange = (selectedOptions: any[]) => {
    const userIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedUserIds(userIds);
  };

  const onSubmit = async (data: ProjectFormValues) => {
    // Validate team members
    if (selectedUserIds.length === 0) {
      // For edit dialog, we don't require team members validation
      // as the project might already exist without assignees
    }
    
    // Call the onSave function with form data and assignees
    onSave({
      ...data,
      assignees: selectedUserIds
    });
  };
  
  const nextStep = () => {
    if (step === 1) {
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
    setStep(1);
    onClose();
  };
  
  // Format companies for react-select with favicon
  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name,
    website: company.website,
    logoUrl: company.logo_url,
    isSubsidiary: !!company.parent_id
  }));

  // Format users for react-select
  const userOptions = users.map(user => ({
    value: user.id,
    label: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User',
    avatar_url: user.avatar_url,
    first_name: user.first_name,
    last_name: user.last_name
  }));

  // Get current selected values for react-select
  const selectedCompanyOption = companyOptions.find(option => option.value === watch("company_id"));
  const selectedUserOptions = userOptions.filter(option => selectedUserIds.includes(option.value));

  // Custom components for react-select
  const CompanyOption = ({ data, ...props }: any) => (
    <div {...props.innerProps} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
      <CompanyFavicon 
        companyName={data.label} 
        website={data.website}
        logoUrl={data.logoUrl}
        size="sm"
      />
      <div>
        {data.label}
      </div>
    </div>
  );

  const CompanySingleValue = ({ data }: any) => (
    <div className="flex items-center gap-2 w-full h-full overflow-hidden min-h-0">
      <CompanyFavicon 
        companyName={data.label} 
        website={data.website}
        logoUrl={data.logoUrl}
        size="sm"
      />
      <span className="truncate flex-1 min-w-0">{data.label}</span>
    </div>
  );

  const UserOption = ({ data, ...props }: any) => (
    <div {...props.innerProps} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
      <Avatar className="h-6 w-6">
        <AvatarImage src={data.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {((data.first_name?.[0] || '') + (data.last_name?.[0] || '')).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <span>{data.label}</span>
    </div>
  );

  const UserMultiValue = ({ data, removeProps }: any) => (
    <div className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
      <Avatar className="h-4 w-4">
        <AvatarImage src={data.avatar_url || undefined} />
        <AvatarFallback className="text-[10px]">
          {((data.first_name?.[0] || '') + (data.last_name?.[0] || '')).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <span className="max-w-[100px] truncate">{data.label}</span>
      <button 
        {...removeProps}
        className="ml-1 text-muted-foreground hover:text-foreground"
      >
        ×
      </button>
    </div>
  );

  // React-select custom styles
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      borderRadius: 'var(--radius)',
      borderColor: 'hsl(var(--input))',
      '&:hover': {
        borderColor: 'hsl(var(--input))'
      },
      boxShadow: 'none',
      minHeight: '40px',
      height: '40px'
    }),
    valueContainer: (base: any) => ({
      ...base,
      height: '38px',
      padding: '0 8px',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden'
    }),
    singleValue: (base: any) => ({
      ...base,
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      margin: 0,
      overflow: 'hidden',
      maxHeight: '36px'
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      zIndex: 50
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: 'transparent'
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      padding: 0
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      display: 'none'
    })
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Project</DialogTitle>
        </DialogHeader>
        
        <ProgressStepper currentStep={step} totalSteps={totalSteps} />
        
        <div className="space-y-4">
          {/* Step 1: Basic Project Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input 
                  id="name" 
                  placeholder="Enter project name" 
                  {...register("name")} 
                  className="w-full"
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company_id">Company *</Label>
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={companyOptions}
                  value={selectedCompanyOption}
                  isLoading={companiesLoading}
                  placeholder="Select a company"
                  isClearable
                  isSearchable
                  components={{
                    Option: CompanyOption,
                    SingleValue: CompanySingleValue
                  }}
                  onChange={(option) => setValue("company_id", option?.value || "")}
                  styles={selectStyles}
                />
                {errors.company_id && <p className="text-sm text-red-500">{errors.company_id.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label>Price Type *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      watch("price_type") === "fixed" 
                        ? "ring-2 ring-primary border-primary" 
                        : "hover:border-muted-foreground"
                    )}
                    onClick={() => setValue("price_type", "fixed")}
                  >
                    <CardContent className="flex flex-col items-center p-4">
                      <Calculator className="h-8 w-8 mb-2 text-primary" />
                      <h3 className="font-semibold">Fixed</h3>
                      <p className="text-sm text-muted-foreground text-center">
                        Set price with clear scope
                      </p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      watch("price_type") === "estimated" 
                        ? "ring-2 ring-primary border-primary" 
                        : "hover:border-muted-foreground"
                    )}
                    onClick={() => setValue("price_type", "estimated")}
                  >
                    <CardContent className="flex flex-col items-center p-4">
                      <TrendingUp className="h-8 w-8 mb-2 text-primary" />
                      <h3 className="font-semibold">Estimated</h3>
                      <p className="text-sm text-muted-foreground text-center">
                        Flexible pricing based on time
                      </p>
                    </CardContent>
                  </Card>
                </div>
                {errors.price_type && <p className="text-sm text-red-500">{errors.price_type.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="value">Project Value (NOK) *</Label>
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
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description" 
                  className="min-h-[120px]" 
                  placeholder="Project description..." 
                  {...register("description")} 
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
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
                <Select
                  isMulti
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={userOptions}
                  value={selectedUserOptions}
                  placeholder="Select team members for this project"
                  isClearable
                  isSearchable
                  components={{
                    Option: UserOption,
                    MultiValue: UserMultiValue
                  }}
                  onChange={handleUsersChange}
                  styles={selectStyles}
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
                disabled={isLoading} 
                className="bg-evergreen hover:bg-evergreen/90"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
