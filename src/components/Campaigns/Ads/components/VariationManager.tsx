
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  form: any;
  fieldName: string;
  title: string;
  description: string;
  maxVariations: number;
  maxLength?: number;
  aiGenerated: boolean;
}

export function VariationManager({ 
  form, 
  fieldName, 
  title, 
  description, 
  maxVariations, 
  maxLength,
  aiGenerated 
}: Props) {
  const [variations, setVariations] = React.useState<number[]>([]);
  
  const addVariation = () => {
    if (variations.length < maxVariations - 1) {
      setVariations([...variations, variations.length]);
    }
  };
  
  const removeVariation = (index: number) => {
    const newVariations = variations.filter((_, i) => i !== index);
    setVariations(newVariations);
    form.setValue(`${fieldName}_variations.${index}.text`, '');
  };
  
  const baseValue = form.watch(fieldName) || '';
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {title}
              {aiGenerated && <Sparkles className="h-4 w-4 text-primary" />}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <Badge variant="outline">
            {variations.length + 1}/{maxVariations}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 w-full">
        {/* Base field */}
        <FormField
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Primary {title.slice(0, -1)}</FormLabel>
              <FormControl>
                <Input
                  maxLength={maxLength}
                  placeholder={`Enter primary ${fieldName}`}
                  {...field}
                  className="w-full"
                />
              </FormControl>
              {maxLength && (
                <div className="text-xs text-muted-foreground">
                  {(field.value || '').length}/{maxLength}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Variation fields */}
        {variations.map((_, index) => (
          <FormField
            key={index}
            control={form.control}
            name={`${fieldName}_variations.${index}.text`}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="flex items-center justify-between w-full">
                  <span>Variation {index + 2}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariation(index)}
                    className="h-auto p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </FormLabel>
                <FormControl>
                  <Input
                    maxLength={maxLength}
                    placeholder={`Enter variation ${index + 2}`}
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                {maxLength && (
                  <div className="text-xs text-muted-foreground">
                    {(field.value || '').length}/{maxLength}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        
        {/* Add variation button */}
        {variations.length < maxVariations - 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={addVariation}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variation ({variations.length + 2}/{maxVariations})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
