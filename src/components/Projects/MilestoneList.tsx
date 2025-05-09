
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Milestone } from '@/types/project';

// UI components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const createMilestoneSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  due_date: z.date().optional(),
});

type CreateMilestoneFormValues = z.infer<typeof createMilestoneSchema>;

interface MilestoneListProps {
  projectId: string;
  milestones: Milestone[] | undefined;
  isLoading: boolean;
  onCreateMilestone: (data: { name: string; due_date?: string }) => void;
  onUpdateMilestoneStatus: (id: string, status: 'created' | 'completed') => void;
  readOnly?: boolean;
}

export default function MilestoneList({
  projectId,
  milestones,
  isLoading,
  onCreateMilestone,
  onUpdateMilestoneStatus,
  readOnly = false,
}: MilestoneListProps) {
  const { isAdmin, isEmployee } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const canEditMilestones = !readOnly && (isAdmin || isEmployee);

  const form = useForm<CreateMilestoneFormValues>({
    resolver: zodResolver(createMilestoneSchema),
    defaultValues: {
      name: '',
      due_date: undefined,
    },
  });

  function onSubmit(values: CreateMilestoneFormValues) {
    onCreateMilestone({
      name: values.name,
      due_date: values.due_date ? values.due_date.toISOString() : undefined,
    });
    form.reset();
    setIsCreateDialogOpen(false);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Milestones</CardTitle>
          {canEditMilestones && (
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              Add Milestone
            </Button>
          )}
        </div>
        <CardDescription>
          Track project progress through milestones
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!milestones || milestones.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No milestones have been created yet
          </div>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div 
                key={milestone.id} 
                className="flex items-center p-3 border rounded-md hover:bg-accent/50 transition-colors"
              >
                {canEditMilestones ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto mr-3"
                    onClick={(e) => {
                      e.preventDefault();
                      onUpdateMilestoneStatus(
                        milestone.id,
                        milestone.status === 'created' ? 'completed' : 'created'
                      );
                    }}
                  >
                    {milestone.status === 'completed' ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </Button>
                ) : (
                  <div className="mr-3">
                    {milestone.status === 'completed' ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="font-medium">
                    {milestone.name}
                    {milestone.status === 'completed' && (
                      <Badge className="ml-2" variant="outline">Completed</Badge>
                    )}
                  </div>
                  {milestone.due_date && (
                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Due {format(new Date(milestone.due_date), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {canEditMilestones && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Milestone</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Milestone Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter milestone name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date (Optional)</FormLabel>
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
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Milestone</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
