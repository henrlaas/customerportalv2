
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useCreateMilestone } from '@/hooks/useCreateMilestone';
import { useCompleteMilestone } from '@/hooks/useCompleteMilestone';
import { useDeleteMilestone } from '@/hooks/useDeleteMilestone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectMilestonesPanelProps {
  projectId: string | null;
  milestones?: any[];
  compact?: boolean;
}

export const ProjectMilestonesPanel: React.FC<ProjectMilestonesPanelProps> = ({
  projectId,
  milestones = [],
  compact = false
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const createMilestone = useCreateMilestone();
  const completeMilestone = useCompleteMilestone();
  const deleteMilestone = useDeleteMilestone();

  // Sort milestones with proper ordering: Started first, Finished last, others by due date
  const sortedMilestones = [...milestones].sort((a, b) => {
    // "Started" milestone should always be first
    if (a.name.toLowerCase().includes('started') || a.name.toLowerCase().includes('start')) return -1;
    if (b.name.toLowerCase().includes('started') || b.name.toLowerCase().includes('start')) return 1;
    
    // "Finished" milestone should always be last
    if (a.name.toLowerCase().includes('finished') || a.name.toLowerCase().includes('finish')) return 1;
    if (b.name.toLowerCase().includes('finished') || b.name.toLowerCase().includes('finish')) return -1;
    
    // Sort others by due date (earliest first)
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;
    
    return 0;
  });

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !newMilestoneName.trim()) return;

    try {
      await createMilestone.mutateAsync({
        projectId,
        name: newMilestoneName,
        dueDate: newMilestoneDueDate || null
      });
      
      setNewMilestoneName('');
      setNewMilestoneDueDate('');
      setIsCreateDialogOpen(false);
      toast.success('Milestone created successfully');
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error('Failed to create milestone');
    }
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    try {
      await completeMilestone.mutateAsync(milestoneId);
      toast.success('Milestone completed');
    } catch (error) {
      console.error('Error completing milestone:', error);
      toast.error('Failed to complete milestone');
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      await deleteMilestone.mutateAsync(milestoneId);
      toast.success('Milestone deleted');
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast.error('Failed to delete milestone');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'created':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // For compact view, show first 3 milestones by default
  const displayedMilestones = compact 
    ? (isExpanded ? sortedMilestones : sortedMilestones.slice(0, 3))
    : sortedMilestones;

  if (compact) {
    return (
      <div className="space-y-3">
        {displayedMilestones.length > 0 ? (
          <>
            {displayedMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{milestone.name}</h4>
                      {getStatusBadge(milestone.status)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(milestone.due_date)}</span>
                    </div>
                  </div>
                  
                  {milestone.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCompleteMilestone(milestone.id)}
                      className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {sortedMilestones.length > 3 && (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      View {sortedMilestones.length - 3} More
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm mb-2">No milestones created yet</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Project Milestones
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Milestone</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateMilestone} className="space-y-4">
                <div>
                  <Label htmlFor="milestone-name">Milestone Name</Label>
                  <Input
                    id="milestone-name"
                    value={newMilestoneName}
                    onChange={(e) => setNewMilestoneName(e.target.value)}
                    placeholder="Enter milestone name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="milestone-due-date">Due Date (Optional)</Label>
                  <Input
                    id="milestone-due-date"
                    type="datetime-local"
                    value={newMilestoneDueDate}
                    onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMilestone.isPending}>
                    {createMilestone.isPending ? 'Creating...' : 'Create Milestone'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {sortedMilestones.length > 0 ? (
          <div className="space-y-4">
            {sortedMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{milestone.name}</h3>
                      {getStatusBadge(milestone.status)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(milestone.due_date)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {milestone.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteMilestone(milestone.id)}
                        disabled={completeMilestone.isPending}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      disabled={deleteMilestone.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No milestones created yet</p>
            <p className="text-gray-400 text-sm mb-4">
              Break down your project into manageable milestones to track progress.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
