
import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Check, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Milestone } from '@/types/project';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface MilestoneListProps {
  projectId: string;
  milestones: Milestone[];
  isLoading: boolean;
  onCreateMilestone: (milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateStatus: (milestoneId: string, status: 'created' | 'completed') => void;
}

const milestoneFormSchema = z.object({
  name: z.string().min(1, 'Milestone name is required'),
  due_date: z.string().optional(),
});

type MilestoneFormValues = z.infer<typeof milestoneFormSchema>;

export const MilestoneList = ({
  projectId,
  milestones,
  isLoading,
  onCreateMilestone,
  onUpdateStatus,
}: MilestoneListProps) => {
  const { isClient } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      name: '',
      due_date: '',
    },
  });

  const onSubmit = (values: MilestoneFormValues) => {
    onCreateMilestone({
      project_id: projectId,
      name: values.name,
      status: 'created',
      due_date: values.due_date || null,
    });
    form.reset();
    setIsDialogOpen(false);
  };

  const toggleMilestoneStatus = (milestone: Milestone) => {
    const newStatus = milestone.status === 'created' ? 'completed' : 'created';
    onUpdateStatus(milestone.id, newStatus);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>Milestones</span>
            {!isClient && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 gap-1"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Milestone
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <p>Loading milestones...</p>
            </div>
          ) : milestones.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No milestones yet.</p>
              {!isClient && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Milestone
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between border rounded-md p-3"
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant={milestone.status === 'completed' ? 'default' : 'outline'}
                      size="icon"
                      className={`h-6 w-6 ${milestone.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      onClick={() => toggleMilestoneStatus(milestone)}
                      disabled={isClient}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <div>
                      <p className={`text-sm ${milestone.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {milestone.name}
                      </p>
                      {milestone.due_date && (
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {format(new Date(milestone.due_date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={milestone.status === 'completed' ? 'default' : 'secondary'}
                  >
                    {milestone.status === 'completed' ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
            <DialogDescription>
              Create a new milestone for this project.
            </DialogDescription>
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
                      <Input placeholder="Complete design phase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Milestone</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
