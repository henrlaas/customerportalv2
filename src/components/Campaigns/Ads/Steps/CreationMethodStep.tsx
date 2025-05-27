
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Wand2, Edit } from 'lucide-react';

interface Props {
  form: any;
  onNext: () => void;
}

export function CreationMethodStep({ form, onNext }: Props) {
  const creationMethod = form.watch('creation_method') || 'manual';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="px-6 pb-6"
    >
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Choose Creation Method</h2>
          <p className="text-sm text-muted-foreground">
            How would you like to create your ad content?
          </p>
        </div>

        <FormField
          control={form.control}
          name="creation_method"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value || 'manual'}
                  className="grid grid-cols-1 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ai" id="ai" />
                    <label 
                      htmlFor="ai" 
                      className="flex-1 cursor-pointer border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Wand2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">AI-Powered Creation</h3>
                          <p className="text-sm text-muted-foreground">
                            Let AI help generate headlines, descriptions, and content based on your prompt
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manual" id="manual" />
                    <label 
                      htmlFor="manual" 
                      className="flex-1 cursor-pointer border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                          <Edit className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">Manual Creation</h3>
                          <p className="text-sm text-muted-foreground">
                            Create your ad content manually with full control
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  );
}
