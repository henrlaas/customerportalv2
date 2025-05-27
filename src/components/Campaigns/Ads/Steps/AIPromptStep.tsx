
import { motion } from 'framer-motion';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

interface Props {
  form: any;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function AIPromptStep({ form, onGenerate, isGenerating }: Props) {
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
          <h2 className="text-xl font-semibold flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Content Generation
          </h2>
          <p className="text-sm text-muted-foreground">
            Describe your ad and let AI generate compelling content for you
          </p>
        </div>

        <FormField
          control={form.control}
          name="ai_prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Describe Your Ad</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Example: A modern fitness app that helps users track workouts and nutrition. Target audience is health-conscious millennials. The tone should be motivating and energetic."
                  className="min-h-[120px] resize-none"
                  maxLength={500}
                />
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Be specific about your product, target audience, and desired tone</span>
                <span>{field.value?.length || 0}/500</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ai_language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Output Language</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || 'norwegian'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language for generated content" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="norwegian">Norwegian</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          onClick={onGenerate}
          disabled={!form.watch('ai_prompt') || isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Content...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Ad Content
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
