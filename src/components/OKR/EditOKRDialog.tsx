
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OKR } from '@/pages/OKRPage';

interface EditOKRDialogProps {
  okr: OKR | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditOKRDialog({ okr, isOpen, onClose, onSuccess }: EditOKRDialogProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    month: 'January' as 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December',
    year: new Date().getFullYear(),
    status: 'draft' as 'draft' | 'active' | 'completed' | 'cancelled',
  });

  // Update form data when OKR changes
  useEffect(() => {
    if (okr) {
      setFormData({
        title: okr.title,
        description: okr.description || '',
        month: okr.month,
        year: okr.year,
        status: okr.status,
      });
    }
  }, [okr]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const updateOKRMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!okr?.id) throw new Error('No OKR to update');
      
      const { error } = await supabase
        .from('okrs')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', okr.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'OKR updated',
        description: 'Your OKR has been updated successfully.',
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating OKR',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for the OKR.',
        variant: 'destructive',
      });
      return;
    }
    updateOKRMutation.mutate(formData);
  };

  if (!okr) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit OKR</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter OKR objective..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the objective and its impact..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="month">Month</Label>
              <Select
                value={formData.month}
                onValueChange={(value) => setFormData({ ...formData, month: value as 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                min={new Date().getFullYear() - 2}
                max={new Date().getFullYear() + 5}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as 'draft' | 'active' | 'completed' | 'cancelled' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateOKRMutation.isPending}>
              {updateOKRMutation.isPending ? 'Updating...' : 'Update OKR'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
