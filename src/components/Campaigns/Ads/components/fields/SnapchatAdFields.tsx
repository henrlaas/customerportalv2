
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface Props {
  form: any;
  aiGenerated: boolean;
}

export function SnapchatAdFields({ form, aiGenerated }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Snapchat Ad Details</CardTitle>
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
            name="brand_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand Name (max 25 characters)</FormLabel>
                <FormControl>
                  <Input 
                    maxLength={25}
                    placeholder="Your brand name" 
                    {...field} 
                  />
                </FormControl>
                <div className="text-xs text-muted-foreground">
                  {(field.value || '').length}/25
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="headline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Headline (max 34 characters)</FormLabel>
                <FormControl>
                  <Input 
                    maxLength={34}
                    placeholder="Catchy headline" 
                    {...field} 
                  />
                </FormControl>
                <div className="text-xs text-muted-foreground">
                  {(field.value || '').length}/34
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
        </CardContent>
      </Card>
    </div>
  );
}
