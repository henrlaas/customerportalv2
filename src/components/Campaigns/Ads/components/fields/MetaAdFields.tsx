
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VariationManager } from '../VariationManager';

interface Props {
  form: any;
  aiGenerated: boolean;
}

export function MetaAdFields({ form, aiGenerated }: Props) {
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
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com" {...field} />
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
                  <FormLabel>Call to Action</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select CTA" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Learn More">Learn More</SelectItem>
                      <SelectItem value="Shop Now">Shop Now</SelectItem>
                      <SelectItem value="Sign Up">Sign Up</SelectItem>
                      <SelectItem value="Download">Download</SelectItem>
                      <SelectItem value="Contact Us">Contact Us</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Headlines */}
      <VariationManager
        form={form}
        fieldName="headline"
        title="Headlines"
        description="Add up to 5 different headlines (max 40 characters each)"
        maxVariations={5}
        maxLength={40}
        aiGenerated={aiGenerated}
      />

      {/* Main Text */}
      <VariationManager
        form={form}
        fieldName="main_text"
        title="Main Text"
        description="Add up to 5 different main texts (max 125 characters each)"
        maxVariations={5}
        maxLength={125}
        aiGenerated={aiGenerated}
      />

      {/* Descriptions */}
      <VariationManager
        form={form}
        fieldName="description"
        title="Descriptions"
        description="Add up to 5 different descriptions (max 30 characters each)"
        maxVariations={5}
        maxLength={30}
        aiGenerated={aiGenerated}
      />
    </div>
  );
}
