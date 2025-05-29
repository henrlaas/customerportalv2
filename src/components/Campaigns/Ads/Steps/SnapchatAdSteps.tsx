
import { motion } from 'framer-motion';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileInfo } from '../types';
import { AdDialogPreview } from '../components/AdDialogPreview';
import { Platform } from '../../types/campaign';

interface Props {
  step: number;
  setStep: (step: number) => void;
  fileInfo: FileInfo | null;
  setFileInfo: (info: FileInfo | null) => void;
  form: any;
  toast: any;
  validPlatform: string;
  uploading: boolean;
}

export function SnapchatAdSteps({ step, setStep, fileInfo, setFileInfo, form, toast, validPlatform, uploading }: Props) {
  // Cast platform to the correct type
  const typedPlatform = validPlatform as Platform;

  // Get watched fields for the current variation
  const getWatchedFieldsForCurrentVariation = () => ({
    headline: form.watch('headline') || '',
    description: '',
    main_text: '',
    keywords: '',
    brand_name: form.watch('brand_name') || '',
    cta_button: '',
    url: form.watch('url') || '',
  });

  // This validates step 0 for Snapchat ads
  const validateStep0 = () => {
    const adName = form.watch('name')?.trim();
    if (!adName) {
      toast({
        title: 'Missing information',
        description: 'Please provide an ad name.',
        variant: 'destructive',
      });
      return false;
    }
    if (!fileInfo) {
      toast({
        title: 'Missing file',
        description: 'Please upload an image or video for your ad.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  return (
    <>
      {step === 0 && (
        <motion.div
          key="snapchat-step-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="px-6 pb-6"
        >
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your ad name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Media</FormLabel>
              {!fileInfo ? (
                <div className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/20">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      if (!e.target.files || e.target.files.length === 0) return;
                      const file = e.target.files[0];
                      const fileExt = file.name.split('.').pop()?.toLowerCase();
                      let adType: 'image' | 'video' | 'text' = 'text';
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
                    }}
                  />
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">Images or Video</p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  {fileInfo.type === 'image' ? (
                    <img
                      src={fileInfo.url}
                      alt="Uploaded media"
                      className="w-full h-36 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={fileInfo.url}
                      className="w-full h-36 object-cover rounded-lg"
                      controls
                    />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFileInfo(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div
          key="snapchat-step-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headline</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter headline" maxLength={34} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter brand name" maxLength={25} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com" type="url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <AdDialogPreview 
              fileInfo={fileInfo}
              watchedFields={getWatchedFieldsForCurrentVariation()}
              platform={typedPlatform}
              limits={{ headline: 34, brand_name: 25 }}
              variation={0}
            />
          </div>
        </motion.div>
      )}
    </>
  );
}
