
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Milestone } from '@/hooks/useProjectMilestones';
import { Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useCompleteMilestone } from '@/hooks/useCompleteMilestone';
import { useCreateMilestone } from '@/hooks/useCreateMilestone';

interface ProjectMilestonesPanelProps {
  projectId: string | null;
  milestones: Milestone[];
}

export const ProjectMilestonesPanel = ({ projectId, milestones }: ProjectMilestonesPanelProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const { completeMilestone, isLoading: isCompleting } = useCompleteMilestone();
  const { createMilestone, isLoading: isCreating } = useCreateMilestone();
  const [orderedMilestones, setOrderedMilestones] = useState<Milestone[]>([]);

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
  }, [milestones]);

  const handleCompleteMilestone = async (milestoneId: string) => {
    if (!projectId) return;
    await completeMilestone(milestoneId);
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

  if (!projectId) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Milestones</h3>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
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
        <div className="flex flex-wrap items-start gap-2">
          {orderedMilestones.map((milestone, index) => (
            <React.Fragment key={milestone.id}>
              <Card className={`${milestone.status === 'completed' ? 'bg-muted/50' : ''} flex-1 min-w-[250px]`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{milestone.name}</CardTitle>
                    <Badge variant={milestone.status === 'completed' ? 'default' : 'secondary'}>
                      {milestone.status === 'completed' ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {milestone.due_date && (
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Due: {format(new Date(milestone.due_date), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  
                  {milestone.status !== 'completed' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleCompleteMilestone(milestone.id)}
                      disabled={isCompleting}
                    >
                      Mark as Completed
                    </Button>
                  )}
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
    </div>
  );
};
