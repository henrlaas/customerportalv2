
import { useMutation } from '@tanstack/react-query';
import { newsService, NewsItem } from '@/services/newsService';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface DeleteNewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newsItem: NewsItem;
  onSuccess: () => void;
}

export function DeleteNewsDialog({ open, onOpenChange, newsItem, onSuccess }: DeleteNewsDialogProps) {
  const { toast } = useToast();

  const deleteNewsMutation = useMutation({
    mutationFn: async () => {
      // Delete the banner image if it exists
      if (newsItem.image_banner) {
        await newsService.deleteBanner(newsItem.image_banner);
      }
      // Delete the news article
      await newsService.delete(newsItem.id);
    },
    onSuccess: () => {
      toast({
        title: 'News deleted',
        description: 'The news article has been deleted successfully',
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDelete = () => {
    deleteNewsMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete News Article
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the news article and its banner image.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You are about to delete "{newsItem.title}". This action is irreversible.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteNewsMutation.isPending}
          >
            {deleteNewsMutation.isPending ? 'Deleting...' : 'Delete Article'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
