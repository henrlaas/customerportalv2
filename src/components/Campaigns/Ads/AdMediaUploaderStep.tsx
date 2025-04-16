
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AdMediaUploader } from './AdMediaUploader';
import { FileInfo } from './types';
import { UseFormReturn } from 'react-hook-form';
import { AdFormData } from '../types/campaign';
import { ArrowRight } from 'lucide-react';

interface AdMediaUploaderStepProps {
  fileInfo: FileInfo | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  form: UseFormReturn<AdFormData>;
  onNextStep: () => void;
}

export function AdMediaUploaderStep({ 
  fileInfo, 
  onFileChange, 
  onRemoveFile, 
  form, 
  onNextStep 
}: AdMediaUploaderStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ad Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter ad name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <AdMediaUploader
        fileInfo={fileInfo}
        onFileChange={onFileChange}
        onRemoveFile={onRemoveFile}
      />
      
      <div className="flex justify-end">
        <Button 
          type="button" 
          onClick={onNextStep}
          disabled={!fileInfo || !form.watch('name')}
        >
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
