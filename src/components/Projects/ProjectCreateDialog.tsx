
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { useMilestones } from '@/hooks/useMilestones';
import { generateProjectContract } from '@/services/contractService';
import { useProjectAssignees } from '@/hooks/useProjectAssignees';

// UI Components
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { UserSelect } from '@/components/Tasks/UserSelect';
import { useToast } from '@/components/ui/use-toast';

// Schema
const createProjectSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  company_id: z.string().min(1, 'Company is required'),
  value: z.number().optional(),
  price_type: z.enum(['fixed', 'estimated']).optional(),
  deadline: z.date().optional(),
  assigned_users: z.array(z.string()).optional(),
});

// Types
type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

// Props
interface ProjectCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Array<{ id: string; name: string }>;
}

export default function ProjectCreateDialog({ isOpen, onClose, companies }: ProjectCreateDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { createProject } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createMilestone } = useMilestones();

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      company_id: '',
      value: undefined,
      price_type: 'fixed',
      deadline: undefined,
      assigned_users: [],
    },
  });

  async function onSubmit(values: CreateProjectFormValues) {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to create a project",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create project
      const projectData = {
        name: values.name,
        description: values.description,
        company_id: values.company_id,
        value: values.value,
        price_type: values.price_type,
        deadline: values.deadline ? values.deadline.toISOString() : undefined,
        created_by: user.id,
      };

      const response = await createProject.mutateAsync(projectData);
      
      // Create initial milestone
      if (response) {
        // Create a milestone for the new project
        try {
          await createMilestone.mutateAsync({
            project_id: response.id,
            name: 'Project Started',
            status: 'created'
          });
        } catch (milestoneError) {
          console.error('Error creating initial milestone:', milestoneError);
        }

        // Assign users to the project if any were selected
        if (values.assigned_users && values.assigned_users.length > 0) {
          const { assignUsers } = useProjectAssignees(response.id);
          try {
            await assignUsers.mutateAsync(values.assigned_users);
            console.log('Users assigned successfully');
          } catch (assignError) {
            console.error('Error assigning users:', assignError);
          }
        }

        // Generate contract
        try {
          const contract = await generateProjectContract(response, user.id);
          console.log('Contract generated:', contract);
        } catch (contractError) {
          console.error('Error generating contract:', contractError);
          toast({
            title: 'Contract generation failed',
            description: 'The project was created, but there was an error generating the contract',
            variant: 'destructive'
          });
        }
      }

      form.reset();
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error creating project',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the project" 
                      className="resize-none min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value (NOK)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select price type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="estimated">Estimated Price</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Deadline (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigned_users"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Users (Optional)</FormLabel>
                  <FormControl>
                    <UserSelect 
                      selectedUserId={null}
                      onChange={() => {}}
                      selectedUserIds={field.value || []}
                      onUsersChange={field.onChange}
                      placeholder="Select users to assign"
                      multiple={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
