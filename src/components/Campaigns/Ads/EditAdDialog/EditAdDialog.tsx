
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EditAdDialogProps {
  ad: any;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function EditAdDialog({ ad, trigger, onSuccess }: EditAdDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      const { error } = await supabase
        .from('ads')
        .update({
          name: formData.get('name'),
          headline: formData.get('headline'),
          description: formData.get('description'),
          main_text: formData.get('main_text'),
          keywords: formData.get('keywords'),
          url: formData.get('url'),
          cta_button: formData.get('cta_button'),
          brand_name: formData.get('brand_name'),
        })
        .eq('id', ad.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Ad updated successfully',
      });

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update ad',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Ad</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input
              id="name"
              name="name"
              defaultValue={ad.name}
              className="w-full rounded-md border border-input px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label htmlFor="headline" className="block text-sm font-medium mb-1">Headline</label>
            <input
              id="headline"
              name="headline"
              defaultValue={ad.headline}
              className="w-full rounded-md border border-input px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              defaultValue={ad.description}
              className="w-full rounded-md border border-input px-3 py-2"
              rows={3}
            />
          </div>
          
          <div>
            <label htmlFor="main_text" className="block text-sm font-medium mb-1">Main Text</label>
            <textarea
              id="main_text"
              name="main_text"
              defaultValue={ad.main_text}
              className="w-full rounded-md border border-input px-3 py-2"
              rows={3}
            />
          </div>
          
          <div>
            <label htmlFor="keywords" className="block text-sm font-medium mb-1">Keywords</label>
            <input
              id="keywords"
              name="keywords"
              defaultValue={ad.keywords}
              className="w-full rounded-md border border-input px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-1">URL</label>
            <input
              id="url"
              name="url"
              defaultValue={ad.url}
              className="w-full rounded-md border border-input px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="cta_button" className="block text-sm font-medium mb-1">CTA Button</label>
            <input
              id="cta_button"
              name="cta_button"
              defaultValue={ad.cta_button}
              className="w-full rounded-md border border-input px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="brand_name" className="block text-sm font-medium mb-1">Brand Name</label>
            <input
              id="brand_name"
              name="brand_name"
              defaultValue={ad.brand_name}
              className="w-full rounded-md border border-input px-3 py-2"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
