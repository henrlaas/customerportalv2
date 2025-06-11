
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BasicInfoStage } from './BasicInfoStage';
import { DetailsStage } from './DetailsStage';
import { TeamStage } from './TeamStage';
import { ConfirmationStage } from './ConfirmationStage';
import { ProgressStepper } from './ProgressStepper';
import { ProjectWithRelations } from '@/hooks/useProjects';
import { ProjectAssignee } from '@/hooks/useProjectAssignees';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  company_id: z.string().min(1, 'Company is required'),
  value: z.number().optional(),
  price_type: z.string().optional(),
  deadline: z.string().optional(),
  assignees: z.array(z.string()).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface EditProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectFormData) => void;
  project: ProjectWithRelations;
  assignees: ProjectAssignee[];
  isLoading: boolean;
}

const stages = [
  { id: 1, name: 'Basic Info' },
  { id: 2, name: 'Details' },
  { id: 3, name: 'Team' },
  { id: 4, name: 'Confirmation' },
];

export const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  project,
  assignees,
  isLoading
}) => {
  const [currentStage, setCurrentStage] = useState(1);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project.name,
      description: project.description || '',
      company_id: project.company_id,
      value: project.value || undefined,
      price_type: project.price_type || '',
      deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
      assignees: assignees.map(assignee => assignee.user_id),
    }
  });

  // Reset form when project changes
  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description || '',
        company_id: project.company_id,
        value: project.value || undefined,
        price_type: project.price_type || '',
        deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
        assignees: assignees.map(assignee => assignee.user_id),
      });
    }
  }, [project, assignees, form]);

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid && currentStage < stages.length) {
      setCurrentStage(currentStage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
    }
  };

  const handleSubmit = (data: ProjectFormData) => {
    onSave(data);
  };

  const handleClose = () => {
    setCurrentStage(1);
    onClose();
  };

  const renderStage = () => {
    switch (currentStage) {
      case 1:
        return <BasicInfoStage form={form} />;
      case 2:
        return <DetailsStage form={form} />;
      case 3:
        return <TeamStage form={form} projectId={project.id} />;
      case 4:
        return <ConfirmationStage form={form} project={project} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <ProgressStepper stages={stages} currentStage={currentStage} />

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {renderStage()}

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={currentStage === 1 ? handleClose : handlePrevious}
              >
                {currentStage === 1 ? 'Cancel' : 'Previous'}
              </Button>

              {currentStage < stages.length ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
