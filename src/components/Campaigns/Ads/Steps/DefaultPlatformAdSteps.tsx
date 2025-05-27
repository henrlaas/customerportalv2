
import { motion } from 'framer-motion';
import { BasicInfoStep } from './BasicInfoStep';
import { VariationStep } from './VariationStep';
import { UrlAndCtaStep } from './UrlAndCtaStep';
import { ConfirmationStep } from './ConfirmationStep';
import { AdDialogPreview } from '../components/AdDialogPreview';

interface Props {
  steps: any[];
  step: number;
  setStep: (s: number) => void;
  form: any;
  fileInfo: any;
  setFileInfo: (info: any) => void;
  validateStepFn: (...args: any[]) => boolean;
  validPlatform: any;
  limits: any;
  toast: any;
  getWatchedFieldsForCurrentVariation: () => any;
}

export function DefaultPlatformAdSteps({
  steps,
  step,
  setStep,
  form,
  fileInfo,
  setFileInfo,
  validateStepFn,
  validPlatform,
  limits,
  toast,
  getWatchedFieldsForCurrentVariation,
}: Props) {
  const isGoogle = validPlatform === 'Google';

  return (
    <>
      {steps.map((platformStep, idx) => {
        // Basic Info
        if (step === idx && idx === 0) {
          return (
            <motion.div
              key={`step-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="px-6 pb-6"
            >
              <BasicInfoStep
                fileInfo={fileInfo}
                onFileChange={(e) => {
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
                onRemoveFile={() => setFileInfo(null)}
                form={form}
                onNextStep={() => {
                  if (validateStepFn(step, form, fileInfo, validPlatform, () => true, toast)) {
                    setStep(step + 1);
                  }
                }}
                hideFileUpload={isGoogle}
              />
            </motion.div>
          );
        }
        // Platform-specific steps (skip preview for some steps)
        // Show preview only for chosen platforms/steps
        if (
          step === idx &&
          (
            (validPlatform === 'Meta' || validPlatform === 'LinkedIn') ?
              idx >= 2 && idx <= 6 :
              true
          )
        ) {
          return (
            <motion.div
              key={`step-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={
                idx >= 2 && idx <= 6
                  ? "grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6"
                  : "px-6 pb-6"
              }
            >
              <div className="space-y-6">
                <VariationStep
                  form={form}
                  platform={validPlatform}
                  variation={idx - 2}
                  fields={platformStep.fields || []}
                  showBasicFields={platformStep.showBasicFields}
                />
              </div>
              {idx >= 2 && idx <= 6 && (
                <AdDialogPreview
                  fileInfo={fileInfo}
                  watchedFields={getWatchedFieldsForCurrentVariation()}
                  platform={validPlatform}
                  limits={limits}
                  variation={idx - 2}
                />
              )}
            </motion.div>
          );
        }
        // URL & CTA step for Meta/LinkedIn
        if (step === idx && idx === 1 && (validPlatform === 'Meta' || validPlatform === 'LinkedIn')) {
          return (
            <motion.div
              key={`step-${idx}-urlcta`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="px-6 pb-6"
            >
              <UrlAndCtaStep form={form} />
            </motion.div>
          );
        }
        // Confirmation Step
        if (step === idx && idx === steps.length - 1) {
          return (
            <motion.div
              key="step-confirmation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="px-6 pb-6"
            >
              <ConfirmationStep form={form} platform={validPlatform} />
            </motion.div>
          );
        }
        return null;
      })}
    </>
  );
}
