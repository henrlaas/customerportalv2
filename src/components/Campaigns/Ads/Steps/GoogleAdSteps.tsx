
import { motion } from 'framer-motion';
import { AdDialogPreview } from '../components/AdDialogPreview';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

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
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              <p className="text-sm text-muted-foreground">
                Enter your ad name to get started
              </p>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter ad name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Headlines</h2>
              <p className="text-sm text-muted-foreground">
                Add up to 10 different headlines for your ad
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(10)].map((_, i) => (
                <FormField
                  key={i}
                  control={form.control}
                  name={`headline_variations.${i}.text`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Headline {i + 1} 
                        <span className="text-xs text-muted-foreground ml-1">
                          ({(field.value || '').length}/30)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          maxLength={30}
                          placeholder={`Enter headline ${i + 1}`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
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
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Descriptions</h2>
              <p className="text-sm text-muted-foreground">
                Add up to 4 different descriptions for your ad
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <FormField
                  key={i}
                  control={form.control}
                  name={`description_variations.${i}.text`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Description {i + 1}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({(field.value || '').length}/90)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          maxLength={90}
                          placeholder={`Enter description ${i + 1}`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
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
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Keywords</h2>
              <p className="text-sm text-muted-foreground">
                Add up to 5 different keyword sets for your ad
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(5)].map((_, i) => (
                <FormField
                  key={i}
                  control={form.control}
                  name={`keywords_variations.${i}.text`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Keywords Set {i + 1}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({(field.value || '').length}/80)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          maxLength={80}
                          placeholder={`Enter keywords set ${i + 1}`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
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
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">URL</h2>
              <p className="text-sm text-muted-foreground">
                Set the URL where users will be directed
              </p>
            </div>
            
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Landing Page URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
