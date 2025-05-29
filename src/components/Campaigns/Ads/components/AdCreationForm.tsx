
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Platform } from '../../types/campaign';
import { FileInfo } from '../types';
import { PlatformFieldsRenderer } from './PlatformFieldsRenderer';
import { MediaUploadSection } from './MediaUploadSection';
import { AIContentAssistant } from './AIContentAssistant';
import { ValidationProvider } from './ValidationProvider';
import { requiresMediaUpload } from '../types/variations';

interface Props {
  form: any;
  platform: Platform;
  fileInfo: FileInfo | null;
  setFileInfo: (fileInfo: FileInfo | null) => void;
  onSubmit: (data: any) => Promise<void>;
  uploading: boolean;
}

export function AdCreationForm({ form, platform, fileInfo, setFileInfo, onSubmit, uploading }: Props) {
  const [aiGenerated, setAiGenerated] = React.useState(false);
  
  const handleSubmit = form.handleSubmit(onSubmit);
  
  return (
    <ValidationProvider platform={platform}>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="flex flex-col h-full w-full">
          {/* Form Fields */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="space-y-8 w-full max-w-2xl mx-auto">
              {/* AI Assistant */}
              <AIContentAssistant
                form={form}
                platform={platform}
                onGenerated={() => setAiGenerated(true)}
              />
              
              {/* Media Upload */}
              {requiresMediaUpload(platform) && (
                <MediaUploadSection
                  fileInfo={fileInfo}
                  setFileInfo={setFileInfo}
                  platform={platform}
                />
              )}
              
              {/* Platform-Specific Fields */}
              <PlatformFieldsRenderer
                form={form}
                platform={platform}
                aiGenerated={aiGenerated}
              />
            </div>
          </div>
          
          {/* Submit Button - Fixed at bottom */}
          <div className="flex-shrink-0 p-8 border-t bg-background">
            <Button 
              type="submit" 
              className="w-full max-w-md mx-auto"
              disabled={uploading}
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Ad...
                </>
              ) : (
                'Create Ad'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ValidationProvider>
  );
}
