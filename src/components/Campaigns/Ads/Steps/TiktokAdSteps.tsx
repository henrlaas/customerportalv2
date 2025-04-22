
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AdDialogPreview } from '../components/AdDialogPreview';
import { FileInfo } from '../types';
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

export function TiktokAdSteps({ step, setStep, fileInfo, setFileInfo, form, toast, validPlatform, uploading }: Props) {
  const getWatchedFieldsForCurrentVariation = () => ({
    headline: form.watch('headline') || '',
    description: '',
    main_text: '',
    keywords: '',
    brand_name: '',
    cta_button: '',
    url: form.watch('url') || '',
  });

  // Cast validPlatform to the Platform type which is expected by AdDialogPreview
  const typedPlatform = validPlatform as Platform;

  return (
    <>
      {step === 0 && (
        <motion.div
          key="tiktok-step-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="px-6 pb-6"
        >
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm mb-1 font-medium">Ad Name</label>
            <input
              id="name"
              type="text"
              className="w-full border rounded px-3 py-2"
              {...form.register('name', { required: true })}
              maxLength={80}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm mb-1 font-medium">Image or Video</label>
            {!fileInfo ? (
              <input
                type="file"
                accept="image/*,video/*"
                onChange={async (e) => {
                  if (!e.target.files || e.target.files.length === 0) return;
                  const file = e.target.files[0];
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
                }}
                className="border border-dashed border-primary px-4 py-2 rounded w-full"
              />
            ) : (
              <div className="flex items-center space-x-4">
                {fileInfo.type === 'image' ? (
                  <img src={fileInfo.url} alt="Ad media preview" className="h-20 rounded" />
                ) : (
                  <video src={fileInfo.url} controls className="h-20 rounded" />
                )}
                <Button type="button" variant="destructive" size="sm" onClick={() => setFileInfo(null)}>
                  Remove
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => {
                const adName = form.watch('name')?.trim();
                if (!adName) {
                  toast({
                    title: 'Missing information',
                    description: 'Please provide an ad name.',
                    variant: 'destructive',
                  });
                  return;
                }
                if (!fileInfo) {
                  toast({
                    title: 'Missing file',
                    description: 'Please upload an image or video for your ad.',
                    variant: 'destructive',
                  });
                  return;
                }
                setStep(1);
              }}>
              Next
            </Button>
          </div>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div
          key="tiktok-step-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6"
        >
          <div className="space-y-6">
            <div>
              <label htmlFor="headline" className="block text-sm mb-1 font-medium">Headline</label>
              <input
                id="headline"
                type="text"
                maxLength={80}
                className="w-full border rounded px-3 py-2"
                {...form.register('headline')}
              />
            </div>
            <div>
              <label htmlFor="url" className="block text-sm mb-1 font-medium">URL</label>
              <input
                id="url"
                type="text"
                className="w-full border rounded px-3 py-2"
                {...form.register('url')}
              />
            </div>
          </div>
          <div>
            <AdDialogPreview
              fileInfo={fileInfo}
              watchedFields={getWatchedFieldsForCurrentVariation()}
              platform={typedPlatform}
              limits={{ headline: 80 }}
              variation={0}
            />
          </div>
        </motion.div>
      )}
    </>
  );
}
