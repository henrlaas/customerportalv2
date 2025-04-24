
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Link, Zap } from 'lucide-react';
import { AdFormData } from '../../types/campaign';
import { CTA_BUTTON_OPTIONS } from '../types';

interface UrlAndCtaStepProps {
  form: UseFormReturn<AdFormData>;
}

export function UrlAndCtaStep({ form }: UrlAndCtaStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-medium text-primary mb-2">
        <Globe className="h-5 w-5 text-primary" />
        <h3>Destination & Call-to-Action</h3>
      </div>
      
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Link className="h-4 w-4 text-primary" /> Landing Page URL
              </FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/landing-page" {...field} className="transition-all focus:ring-2 focus:ring-primary/20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cta_button"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Call to Action Button
              </FormLabel>
              <Select
                value={field.value || ''}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select a CTA button" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[200px]">
                  {CTA_BUTTON_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option === 'No button' ? 'no-button' : option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
