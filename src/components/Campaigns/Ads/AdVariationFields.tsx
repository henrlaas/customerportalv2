
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdFormData, Platform, PLATFORM_CHARACTER_LIMITS } from '../types/campaign';
import { cn } from '@/lib/utils';

interface AdVariationFieldsProps {
  form: UseFormReturn<AdFormData>;
  platform: Platform;
  variation: number;
  fields: string[];
  showBasicFields?: boolean;
}

export function AdVariationFields({
  form,
  platform,
  variation,
  fields,
  showBasicFields = false
}: AdVariationFieldsProps) {
  const limits = PLATFORM_CHARACTER_LIMITS[platform] || {};

  const getFieldName = (field: string, variationNum: number) => {
    if (variationNum === 0) return field;
    return `${field}_variations.${variationNum - 1}.text`;
  };

  const renderField = (field: string) => {
    const fieldName = getFieldName(field, variation);
    const limit = limits[field as keyof typeof limits];
    const value = form.watch(fieldName);
    const Component = field === 'main_text' ? Textarea : Input;

    return (
      <FormField
        key={fieldName}
        control={form.control}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {field === 'main_text' ? 'Main Text' : 
               field.charAt(0).toUpperCase() + field.slice(1)}
              {limit && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({value?.length || 0}/{limit})
                </span>
              )}
              {variation > 0 && ` - Variation ${variation}`}
            </FormLabel>
            <FormControl>
              <Component
                {...field}
                maxLength={limit}
                className={cn(
                  value?.length > 0 && limit &&
                  value.length > limit * 0.9 &&
                  "border-yellow-500"
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <div className="space-y-4">
      {fields.map(renderField)}
    </div>
  );
}
