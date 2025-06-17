
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { newsService } from '@/services/newsService';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const createNewsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
});

type CreateNewsForm = z.infer<typeof createNewsSchema>;

interface CreateNewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateNewsDialog({ open, onOpenChange, onSuccess }: CreateNewsDialogProps) {
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<CreateNewsForm>({
    resolver: zodResolver(createNewsSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const createNewsMutation = useMutation({
    mutationFn: async (data: CreateNewsForm) => {
      let bannerUrl: string | undefined;

      if (bannerFile) {
        bannerUrl = await newsService.uploadBanner(bannerFile);
      }

      return newsService.create({
        ...data,
        image_banner: bannerUrl,
      });
    },
    onSuccess: () => {
      toast({
        title: 'News created',
        description: 'The news article has been created successfully',
      });
      onSuccess();
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleClose = () => {
    form.reset();
    setBannerFile(null);
    setBannerPreview(null);
    onOpenChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const onSubmit = (data: CreateNewsForm) => {
    createNewsMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create News Article</DialogTitle>
          <DialogDescription>
            Create a new news article for employees to see on the dashboard.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter news title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter news description..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <label className="text-sm font-medium">Banner Image (Optional)</label>
              
              {bannerPreview ? (
                <div className="relative">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-48 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeBanner}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <div className="mt-4">
                      <label htmlFor="banner-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-muted-foreground">
                          Click to upload banner image
                        </span>
                      </label>
                      <input
                        id="banner-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createNewsMutation.isPending}>
                {createNewsMutation.isPending ? 'Creating...' : 'Create News'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
