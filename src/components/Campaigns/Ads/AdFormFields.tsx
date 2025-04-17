
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { AdFormData, Platform } from '../types/campaign';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CTA_BUTTON_OPTIONS } from './types';

interface AdFormFieldsProps {
  form: UseFormReturn<AdFormData>;
  platform: Platform;
  limits: Record<string, number>;
}

export function AdFormFields({ form, platform, limits }: AdFormFieldsProps) {
  const showMainText = platform === 'Meta' || platform === 'LinkedIn';
  const showDescription = platform === 'Meta' || platform === 'LinkedIn' || platform === 'Google';
  const showKeywords = platform === 'Google';
  const showBrandName = platform === 'Snapchat';
  const showHeadline = true;
  const showCTAButton = platform === 'Meta' || platform === 'LinkedIn';

  return (
    <div className="space-y-4">
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
                    ({field.value?.length || 0}/{limits.headline})
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  maxLength={limits.headline}
                  className={cn(
                    field.value?.length > 0 && limits.headline && 
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
                    ({field.value?.length || 0}/{limits.description})
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  maxLength={limits.description}
                  className={cn(
                    field.value?.length > 0 && limits.description && 
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
                    ({field.value?.length || 0}/{limits.main_text})
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={4}
                  maxLength={limits.main_text}
                  className={cn(
                    field.value?.length > 0 && limits.main_text && 
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

      {showCTAButton && (
        <FormField
          control={form.control}
          name="cta_button"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CTA Button</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || 'No button'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a CTA button" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CTA_BUTTON_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option === 'No button' ? '' : option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    ({field.value?.length || 0}/{limits.keywords})
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  maxLength={limits.keywords}
                  className={cn(
                    field.value?.length > 0 && limits.keywords && 
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
                    ({field.value?.length || 0}/{limits.brand_name})
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  maxLength={limits.brand_name}
                  className={cn(
                    field.value?.length > 0 && limits.brand_name && 
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
  );
}
