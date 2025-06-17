
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateOKRDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  profiles: Array<{
    id: string;
    first_name: string | null;
    last_name: string | null;
  }>;
  currentQuarter: string;
  currentYear: number;
}

export function CreateOKRDialog({ 
  isOpen, 
  onClose, 
  onSuccess, 
  profiles, 
  currentQuarter, 
  currentYear 
}: CreateOKRDialogProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quarter: currentQuarter as 'Q1' | 'Q2' | 'Q3' | 'Q4',
    year: currentYear,
    owner_id: '',
    status: 'draft' as 'draft' | 'active' | 'completed' | 'cancelled',
  });

  const createOKRMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('okrs')
        .insert({
          title: data.title,
          description: data.description,
          quarter: data.quarter,
          year: data.year,
          status: data.status,
          owner_id: data.owner_id || null,
          created_by: (await supabase.auth.getUser()).data.user?.id!,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'OKR created',
        description: 'Your OKR has been created successfully.',
      });
      setFormData({
        title: '',
        description: '',
        quarter: currentQuarter as 'Q1' | 'Q2' | 'Q3' | 'Q4',
        year: currentYear,
        owner_id: '',
        status: 'draft',
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating OKR',
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
    createOKRMutation.mutate(formData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      quarter: currentQuarter as 'Q1' | 'Q2' | 'Q3' | 'Q4',
      year: currentYear,
      owner_id: '',
      status: 'draft',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New OKR</DialogTitle>
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
              <Label htmlFor="quarter">Quarter</Label>
              <Select
                value={formData.quarter}
                onValueChange={(value) => setFormData({ ...formData, quarter: value as 'Q1' | 'Q2' | 'Q3' | 'Q4' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1">Q1</SelectItem>
                  <SelectItem value="Q2">Q2</SelectItem>
                  <SelectItem value="Q3">Q3</SelectItem>
                  <SelectItem value="Q4">Q4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || currentYear })}
                min={currentYear - 2}
                max={currentYear + 5}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="owner">Owner</Label>
            <Select
              value={formData.owner_id}
              onValueChange={(value) => setFormData({ ...formData, owner_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select owner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No owner</SelectItem>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.first_name || profile.last_name
                      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                      : 'Unnamed User'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createOKRMutation.isPending}>
              {createOKRMutation.isPending ? 'Creating...' : 'Create OKR'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
