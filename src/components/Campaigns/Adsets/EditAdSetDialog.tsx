
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit } from 'lucide-react';

interface EditAdSetDialogProps {
  adset: {
    id: string;
    name: string;
    targeting?: string;
  };
  onSuccess?: () => void;
}

export function EditAdSetDialog({ adset, onSuccess }: EditAdSetDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(adset.name);
  const [targeting, setTargeting] = useState(adset.targeting || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('adsets')
        .update({ name, targeting })
        .eq('id', adset.id);

      if (error) throw error;

      toast({
        title: 'Ad Set updated',
        description: 'The ad set has been updated successfully.',
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update ad set. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Ad Set</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ad Set Name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targeting">Targeting</Label>
            <Input
              id="targeting"
              value={targeting}
              onChange={(e) => setTargeting(e.target.value)}
              placeholder="Targeting information"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
