

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Milestone } from '@/hooks/useProjectMilestones';
import { Calendar, ChevronRight, Trash2, ChevronDown, ChevronUp, Target, CheckCircle, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useCompleteMilestone } from '@/hooks/useCompleteMilestone';
import { useCreateMilestone } from '@/hooks/useCreateMilestone';
import { useDeleteMilestone } from '@/hooks/useDeleteMilestone';
import { useToast } from '@/hooks/use-toast';
import '@/components/Campaigns/animations.css';

interface ProjectMilestonesPanelProps {
  projectId: string | null;
  milestones: Milestone[];
  compact?: boolean;
}

export const ProjectMilestonesPanel: React.FC<ProjectMilestonesPanelProps> = ({ 
  projectId, 
  milestones,
  compact = false 
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [selectedMilestoneName, setSelectedMilestoneName] = useState<string>('');
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const { completeMilestone, isLoading: isCompleting } = useCompleteMilestone();
  const { createMilestone, isLoading: isCreating } = useCreateMilestone();
  const { deleteMilestone, isLoading: isDeleting } = useDeleteMilestone();
  const [orderedMilestones, setOrderedMilestones] = useState<Milestone[]>([]);
  const { toast } = useToast();
  const [lastCompletedMilestoneId, setLastCompletedMilestoneId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Order milestones to ensure "Started" is first and "Finished" is last
  useEffect(() => {
    if (!milestones || milestones.length === 0) return;
    
    const startMilestone = milestones.find(m => m.name === "Started") || milestones.find(m => m.name === "Created");
    const finishMilestone = milestones.find(m => m.name === "Finished");
    
    const middleMilestones = milestones.filter(
      m => m.name !== "Started" && m.name !== "Created" && m.name !== "Finished"
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    const ordered: Milestone[] = [];
    
    if (startMilestone) ordered.push(startMilestone);
    ordered.push(...middleMilestones);
    if (finishMilestone) ordered.push(finishMilestone);
    
    setOrderedMilestones(ordered);

    // Find the last completed milestone
    const completedMilestones = ordered.filter(m => m.status === 'completed');
    if (completedMilestones.length > 0) {
      // Get the most recently completed milestone (based on updated_at if available, or created_at)
      const lastCompleted = completedMilestones.reduce((latest, current) => {
        const latestDate = new Date(latest.updated_at || latest.created_at);
        const currentDate = new Date(current.updated_at || current.created_at);
        return currentDate > latestDate ? current : latest;
      }, completedMilestones[0]);
      
      setLastCompletedMilestoneId(lastCompleted.id);
    } else {
      setLastCompletedMilestoneId(null);
    }
  }, [milestones]);

  const handleCompleteMilestone = async (milestoneId: string, status: 'completed' | 'created') => {
    if (!projectId) return;
    
    try {
      if (status === 'created') {
        // Find the index of the current milestone in the ordered list
        const currentIndex = orderedMilestones.findIndex(m => m.id === milestoneId);
        
        // Get all milestones that come after this one in the sequence
        const milestonesToUpdate = orderedMilestones
          .filter((_, index) => index >= currentIndex)
          .filter(m => m.status === 'completed')
          .map(m => m.id);
        
        // Update each milestone status sequentially
        for (const mId of milestonesToUpdate) {
          await completeMilestone({
            milestoneId: mId,
            status: 'created'
          });
        }
        
        toast({
          title: "Milestones updated",
          description: "The selected milestone and all subsequent milestones have been marked as not completed.",
          duration: 3000
        });
      } else {
        // For marking as completed - implement cascading completion
        const currentIndex = orderedMilestones.findIndex(m => m.id === milestoneId);
        
        // Get all milestones from the beginning up to and including the clicked milestone
        const milestonesToComplete = orderedMilestones
          .filter((_, index) => index <= currentIndex)
          .filter(m => m.status === 'created')
          .map(m => m.id);
        
        // Update each milestone status sequentially
        for (const mId of milestonesToComplete) {
          await completeMilestone({
            milestoneId: mId,
            status: 'completed'
          });
        }
        
        const completedCount = milestonesToComplete.length;
        if (completedCount > 1) {
          toast({
            title: "Milestones completed",
            description: `${completedCount} milestones have been marked as completed in sequence.`,
            duration: 3000
          });
        } else {
          toast({
            title: "Milestone completed",
            description: "The milestone has been marked as completed.",
            duration: 3000
          });
        }
      }
    } catch (error) {
      console.error("Error updating milestone status:", error);
      toast({
        title: "Error",
        description: "Failed to update milestone status",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  const handleAddMilestone = async () => {
    if (!projectId || !newMilestoneName.trim()) return;
    
    await createMilestone({
      projectId,
      name: newMilestoneName.trim(),
      status: 'created'
    });
    
    setNewMilestoneName('');
    setIsAddDialogOpen(false);
  };

  const openDeleteDialog = (milestone: Milestone) => {
    setSelectedMilestoneId(milestone.id);
    setSelectedMilestoneName(milestone.name);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteMilestone = async () => {
    if (!selectedMilestoneId) return;
    
    try {
      await deleteMilestone({
        milestoneId: selectedMilestoneId
      });
      
      toast({
        title: "Milestone deleted",
        description: `The milestone "${selectedMilestoneName}" has been deleted.`,
        duration: 3000
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting milestone:", error);
      toast({
        title: "Error",
        description: "Failed to delete the milestone",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  // Calculate milestone statistics
  const totalMilestones = orderedMilestones.length;
  const completedMilestones = orderedMilestones.filter(m => m.status === 'completed').length;
  const notCompletedMilestones = totalMilestones - completedMilestones;
  const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  if (compact) {
    // Reverse the order for compact view: "Finished" first, "Started" last (showing not completed first)
    const reversedMilestones = [...orderedMilestones].reverse();
    const displayedMilestones = isExpanded ? reversedMilestones : reversedMilestones.slice(0, 3);

    return (
      <div className="space-y-3">
        {orderedMilestones.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No milestones created yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    milestone.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{milestone.name}</p>
                    {milestone.due_date && (
                      <p className="text-xs text-gray-500">
                        Due: {new Date(milestone.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={milestone.status === 'completed' ? 'default' : 'outline'}>
                  {milestone.status === 'completed' ? 'Completed' : 'Not completed'}
                </Badge>
              </div>
            ))}
            {orderedMilestones.length > 3 && (
              <div className="text-center pt-2">
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
                      Show {orderedMilestones.length - 3} More
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!projectId) return null;

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Milestones</h3>
      </div>

      {/* Milestone Overview Card */}
      {orderedMilestones.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-primary" />
              Milestone Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-semibold">{totalMilestones}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-xl font-semibold text-green-600">{completedMilestones}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Not Completed</p>
                  <p className="text-xl font-semibold text-orange-600">{notCompletedMilestones}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Milestone Button - positioned below overview card and to the right */}
      <div className="mb-6 flex justify-end">
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {orderedMilestones.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="flex justify-center items-center h-32">
            <p className="text-muted-foreground">No milestones found for this project.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap items-start gap-2 mt-6">
          {orderedMilestones.map((milestone, index) => (
            <React.Fragment key={milestone.id}>
              <Card 
                className={`${milestone.status === 'completed' ? 'bg-muted/50' : ''} w-72 h-[140px] ${
                  milestone.id === lastCompletedMilestoneId ? 'milestone-shine relative overflow-hidden' : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{milestone.name}</CardTitle>
                    <Badge variant={milestone.status === 'completed' ? 'default' : 'secondary'}>
                      {milestone.status === 'completed' ? 'Completed' : 'Not completed'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col h-[calc(100%-64px)]">
                  {milestone.due_date && (
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Due: {format(new Date(milestone.due_date), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-auto gap-2">
                    {milestone.status === 'completed' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleCompleteMilestone(milestone.id, 'created')}
                        disabled={isCompleting}
                      >
                        Unmark as Completed
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleCompleteMilestone(milestone.id, 'completed')}
                        disabled={isCompleting}
                      >
                        Mark as Completed
                      </Button>
                    )}
                    
                    {/* Only allow deletion of custom milestones, not system ones like "Started" and "Finished" */}
                    {milestone.name !== "Started" && milestone.name !== "Created" && milestone.name !== "Finished" && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => openDeleteDialog(milestone)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Add arrow between milestones except after the last one */}
              {index < orderedMilestones.length - 1 && (
                <div className="flex items-center justify-center self-center">
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Add Milestone Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Milestone</DialogTitle>
            <DialogDescription>
              Create a new milestone for this project. It will appear between the "Started" and "Finished" milestones.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Milestone Name
              </label>
              <Input
                id="name"
                placeholder="Enter milestone name"
                value={newMilestoneName}
                onChange={(e) => setNewMilestoneName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddMilestone} 
              disabled={!newMilestoneName.trim() || isCreating}
            >
              Add Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Milestone Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the milestone "{selectedMilestoneName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteMilestone}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
