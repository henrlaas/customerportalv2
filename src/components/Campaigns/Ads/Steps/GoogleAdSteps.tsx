
import { motion } from 'framer-motion';
import { AdDialogPreview } from '../components/AdDialogPreview';
import { BasicInfoStep } from './BasicInfoStep';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  step: number;
  setStep: (step: number) => void;
  form: any;
  fileInfo: any;
  toast: any;
  validateStepFn: any;
  setFileInfo: (i: any) => void;
  uploading: boolean;
  limits: any;
  watchedFields: any;
}

export function GoogleAdSteps({
  step, setStep, form, fileInfo, toast,
  validateStepFn, setFileInfo, uploading, limits, watchedFields
}: Props) {
  return (
    <>
      {step === 0 && (
        <motion.div
          key="google-step-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="px-6 pb-6"
        >
          <BasicInfoStep
            fileInfo={null}
            onFileChange={() => {}}
            onRemoveFile={() => {}}
            form={form}
            onNextStep={() => {
              if (form.watch('name')?.trim()) {
                setStep(step + 1)
              } else {
                toast({
                  title: 'Missing information',
                  description: 'Please provide an ad name.',
                  variant: 'destructive',
                });
              }
            }}
            hideFileUpload={true}
          />
        </motion.div>
      )}
      {step === 1 && (
        <motion.div
          key="google-step-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="px-6 pb-6"
        >
          <h2 className="text-lg font-bold mb-4">Headlines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i}>
                <label className="block text-sm mb-1" htmlFor={`headline_variations.${i}.text`}>
                  Headline {i + 1} <span className="text-xs text-muted-foreground">({(form.watch(`headline_variations.${i}.text`) || '').length}/30)</span>
                </label>
                <input
                  id={`headline_variations.${i}.text`}
                  type="text"
                  maxLength={30}
                  className="w-full border rounded px-3 py-2"
                  {...form.register(`headline_variations.${i}.text`)}
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}
      {step === 2 && (
        <motion.div
          key="google-step-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="px-6 pb-6"
        >
          <h2 className="text-lg font-bold mb-4">Descriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <label className="block text-sm mb-1" htmlFor={`description_variations.${i}.text`}>
                  Description {i + 1} <span className="text-xs text-muted-foreground">({(form.watch(`description_variations.${i}.text`) || '').length}/90)</span>
                </label>
                <input
                  id={`description_variations.${i}.text`}
                  type="text"
                  maxLength={90}
                  className="w-full border rounded px-3 py-2"
                  {...form.register(`description_variations.${i}.text`)}
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}
      {step === 3 && (
        <motion.div
          key="google-step-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="px-6 pb-6"
        >
          <h2 className="text-lg font-bold mb-4">Keywords</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <label className="block text-sm mb-1" htmlFor={`keywords_variations.${i}.text`}>
                  Keywords Set {i + 1} <span className="text-xs text-muted-foreground">({(form.watch(`keywords_variations.${i}.text`) || '').length}/80)</span>
                </label>
                <input
                  id={`keywords_variations.${i}.text`}
                  type="text"
                  maxLength={80}
                  className="w-full border rounded px-3 py-2"
                  {...form.register(`keywords_variations.${i}.text`)}
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}
      {step === 4 && (
        <motion.div
          key="google-step-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6"
        >
          <div>
            <label className="block text-sm mb-1" htmlFor="url">URL</label>
            <input
              id="url"
              type="text"
              className="w-full border rounded px-3 py-2 mb-6"
              {...form.register('url')}
            />
          </div>
          <AdDialogPreview
            fileInfo={null}
            watchedFields={watchedFields}
            platform="Google"
            limits={limits}
            variation={0}
          />
        </motion.div>
      )}
    </>
  );
}
