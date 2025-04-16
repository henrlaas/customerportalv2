import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Upload, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { AdFormData, PLATFORM_CHARACTER_LIMITS } from '../types/campaign';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Props {
  adsetId: string;
  campaignPlatform?: string;
}

type FileInfo = {
  url: string;
  type: string;
  file: File;
};

// Define a concrete type for the watched fields to fix TypeScript errors
interface WatchedFields {
  headline: string;
  description: string;
  main_text: string;
  keywords: string;
  brand_name: string;
}

export function CreateAdDialog({ adsetId, campaignPlatform }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<AdFormData>({
    defaultValues: {
      name: '',
      adset_id: adsetId,
      headline: '',
      description: '',
      main_text: '',
      keywords: '',
      brand_name: '',
    },
  });

  // Properly type the watched fields with non-null values
  const watchedFields: WatchedFields = {
    headline: form.watch('headline') || '',
    description: form.watch('description') || '',
    main_text: form.watch('main_text') || '',
    keywords: form.watch('keywords') || '',
    brand_name: form.watch('brand_name') || '',
  };

  const platform = campaignPlatform as keyof typeof PLATFORM_CHARACTER_LIMITS || 'Meta';
  const limits = PLATFORM_CHARACTER_LIMITS[platform] || {};
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    let adType = 'other';
    
    if (fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'png' || fileExt === 'gif') {
      adType = 'image';
    } else if (fileExt === 'mp4' || fileExt === 'webm' || fileExt === 'mov') {
      adType = 'video';
    }
    
    const previewUrl = URL.createObjectURL(file);
    
    setFileInfo({
      url: previewUrl,
      type: adType,
      file
    });
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    
    const fileExt = file.name.split('.').pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('campaign_media')
      .upload(filePath, file);
      
    if (error) {
      setUploading(false);
      toast({
        title: 'Upload error',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('campaign_media')
      .getPublicUrl(filePath);
      
    setUploading(false);
    return {
      url: publicUrl,
      path: filePath,
      type: file.type,
    };
  };
  
  const onSubmit = async (data: AdFormData) => {
    if (!fileInfo) {
      toast({
        title: 'Missing file',
        description: 'Please upload an image or video for your ad.',
        variant: 'destructive',
      });
      return;
    }
    
    // Upload the file first
    const uploadedFile = await uploadFile(fileInfo.file);
    if (!uploadedFile) return;
    
    // Then create the ad record
    const { error } = await supabase.from('ads').insert({
      ...data,
      ad_type: fileInfo.type,
      file_url: uploadedFile.url,
      file_type: fileInfo.file.type,
    });
    
    if (error) {
      toast({
        title: 'Error creating ad',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Ad created',
      description: 'Your ad has been created successfully.',
    });
    
    // Invalidate and refetch
    await queryClient.invalidateQueries({
      queryKey: ['ads', adsetId]
    });
    
    setOpen(false);
    setStep(1);
    setFileInfo(null);
    form.reset();
  };

  const nextStep = () => {
    if (step === 1 && !fileInfo) {
      toast({
        title: 'Missing file',
        description: 'Please upload an image or video for your ad.',
        variant: 'destructive',
      });
      return;
    }
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  const resetDialog = () => {
    setStep(1);
    setFileInfo(null);
    form.reset();
  };

  // Determine which fields to show based on platform
  const showMainText = platform === 'Meta' || platform === 'LinkedIn';
  const showDescription = platform === 'Meta' || platform === 'LinkedIn' || platform === 'Google';
  const showKeywords = platform === 'Google';
  const showBrandName = platform === 'Snapchat';
  const showHeadline = true; // All platforms have headline

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Ad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Ad</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <FormLabel>Ad Media (Image/Video)</FormLabel>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                    {fileInfo ? (
                      <div className="space-y-4">
                        <div className="relative h-48 mx-auto max-w-xs">
                          {fileInfo.type === 'image' ? (
                            <img 
                              src={fileInfo.url} 
                              alt="Ad preview" 
                              className="w-full h-full object-contain rounded-md"
                            />
                          ) : fileInfo.type === 'video' ? (
                            <video 
                              src={fileInfo.url} 
                              controls 
                              className="w-full h-full object-contain rounded-md"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              File selected: {fileInfo.file.name}
                            </div>
                          )}
                        </div>
                        <Button 
                          type="button" 
                          variant="secondary" 
                          onClick={() => setFileInfo(null)}
                        >
                          Change File
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center justify-center py-6">
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-gray-600 mb-2">Upload an image or video for your ad</p>
                          <p className="text-sm text-gray-500 mb-4">Supports: JPG, PNG, GIF, MP4, WebM</p>
                          <Input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            id="file-upload"
                            onChange={handleFileChange}
                          />
                          <label htmlFor="file-upload">
                            <Button type="button" variant="secondary" asChild>
                              <span>Browse Files</span>
                            </Button>
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    disabled={!form.watch('name') || !fileInfo}
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {showHeadline && (
                    <FormField
                      control={form.control}
                      name="headline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Headline 
                            {limits.headline && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({field.value.length}/{limits.headline})
                              </span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              maxLength={limits.headline} 
                              className={cn(
                                field.value.length > 0 && limits.headline && 
                                field.value.length > limits.headline * 0.9 && 
                                "border-yellow-500"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {showDescription && (
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Description
                            {limits.description && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({field.value.length}/{limits.description})
                              </span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              maxLength={limits.description}
                              className={cn(
                                field.value.length > 0 && limits.description && 
                                field.value.length > limits.description * 0.9 && 
                                "border-yellow-500"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {showMainText && (
                    <FormField
                      control={form.control}
                      name="main_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Main Text
                            {limits.main_text && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({field.value.length}/{limits.main_text})
                              </span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={4} 
                              maxLength={limits.main_text}
                              className={cn(
                                field.value.length > 0 && limits.main_text && 
                                field.value.length > limits.main_text * 0.9 && 
                                "border-yellow-500"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {showKeywords && (
                    <FormField
                      control={form.control}
                      name="keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Keywords
                            {limits.keywords && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({field.value.length}/{limits.keywords})
                              </span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              maxLength={limits.keywords}
                              className={cn(
                                field.value.length > 0 && limits.keywords && 
                                field.value.length > limits.keywords * 0.9 && 
                                "border-yellow-500"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {showBrandName && (
                    <FormField
                      control={form.control}
                      name="brand_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Brand Name
                            {limits.brand_name && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({field.value.length}/{limits.brand_name})
                              </span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              maxLength={limits.brand_name}
                              className={cn(
                                field.value.length > 0 && limits.brand_name && 
                                field.value.length > limits.brand_name * 0.9 && 
                                "border-yellow-500"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                <div className="border rounded-lg p-4 bg-muted/20">
                  <h3 className="font-semibold mb-4 text-lg">Ad Preview</h3>
                  <div className="border rounded-md p-3 space-y-4 bg-white">
                    <div className="relative h-40 bg-gray-100 rounded-md overflow-hidden">
                      {fileInfo?.type === 'image' ? (
                        <img 
                          src={fileInfo.url} 
                          alt="Ad preview" 
                          className="w-full h-full object-contain" 
                        />
                      ) : fileInfo?.type === 'video' ? (
                        <video 
                          src={fileInfo.url} 
                          controls 
                          className="w-full h-full object-contain" 
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No media preview
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {watchedFields.headline && (
                        <div className="text-base font-medium line-clamp-2">{watchedFields.headline}</div>
                      )}
                      
                      {watchedFields.brand_name && (
                        <div className="text-sm text-muted-foreground">{watchedFields.brand_name}</div>
                      )}
                      
                      {watchedFields.main_text && (
                        <div className="text-sm line-clamp-3">{watchedFields.main_text}</div>
                      )}
                      
                      {watchedFields.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2">{watchedFields.description}</div>
                      )}
                      
                      {watchedFields.keywords && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Keywords:</span> {watchedFields.keywords}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>Platform: {platformName(platform)} Ad</p>
                    {limits && Object.keys(limits).length > 0 && (
                      <ul className="mt-2 list-disc list-inside">
                        {Object.entries(limits).map(([key, limit]) => (
                          <li key={key}>{formatFieldName(key)}: max {limit} characters</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between md:col-span-2">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? 'Creating...' : 'Create Ad'} 
                    {uploading ? null : <Check className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function platformName(platform: string): string {
  return platform || 'Unknown';
}

function formatFieldName(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
