
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { VariationManager } from '../VariationManager';

interface Props {
  form: any;
  aiGenerated: boolean;
}

export function GoogleAdFields({ form, aiGenerated }: Props) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Final URL *</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Headlines */}
      <VariationManager
        form={form}
        fieldName="headline"
        title="Headlines"
        description="Add up to 10 different headlines (max 30 characters each)"
        maxVariations={10}
        maxLength={30}
        aiGenerated={aiGenerated}
      />

      {/* Descriptions */}
      <VariationManager
        form={form}
        fieldName="description"
        title="Descriptions"
        description="Add up to 4 different descriptions (max 90 characters each)"
        maxVariations={4}
        maxLength={90}
        aiGenerated={aiGenerated}
      />

      {/* Keywords */}
      <VariationManager
        form={form}
        fieldName="keywords"
        title="Keywords"
        description="Add up to 5 different keyword sets (max 80 characters each)"
        maxVariations={5}
        maxLength={80}
        aiGenerated={aiGenerated}
      />
    </div>
  );
}
