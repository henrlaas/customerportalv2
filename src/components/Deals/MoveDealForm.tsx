
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Stage, Deal } from '@/pages/DealsPage';

interface MoveDealFormProps {
  stages: Stage[];
  currentDeal: Deal | null;
  onSubmit: (values: { stage_id: string }) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  getStageName: (stageId: string | null) => string;
}

export const MoveDealForm: React.FC<MoveDealFormProps> = ({
  stages,
  currentDeal,
  onSubmit,
  isSubmitting,
  onCancel,
  getStageName,
}) => {
  const { register, handleSubmit, setValue, getValues, formState } = useForm({
    defaultValues: {
      stage_id: currentDeal?.stage_id || 'no_stage',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Current Stage: {getStageName(currentDeal?.stage_id)}
        </label>
        <Select
          onValueChange={(value) => setValue('stage_id', value)}
          defaultValue={currentDeal?.stage_id || 'no_stage'}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a new stage" />
          </SelectTrigger>
          <SelectContent>
            {stages.map(stage => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit" 
          disabled={isSubmitting || getValues().stage_id === currentDeal?.stage_id}
        >
          {isSubmitting ? 'Moving...' : 'Move Deal'}
        </Button>
      </DialogFooter>
    </form>
  );
};
