
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Platform } from '../../types/campaign';
import { FileInfo } from '../types';
import { PlatformFieldsRenderer } from './PlatformFieldsRenderer';
import { MediaUploadSection } from './MediaUploadSection';
import { AdPreviewPanel } from './AdPreviewPanel';
import { AIContentAssistant } from './AIContentAssistant';
import { ValidationProvider } from './ValidationProvider';
import { requiresMediaUpload } from '../types/variations';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  
  const formData = form.watch();
  
  return (
    <ValidationProvider platform={platform}>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="h-full flex">
          {/* Left Panel - Form Fields with Proper Scrolling */}
          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
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
                
                {/* Submit Button */}
                <div className="pt-6 border-t">
                  <Button 
                    type="submit" 
                    className="w-full"
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
              </div>
            </ScrollArea>
          </div>
          
          {/* Right Panel - Preview */}
          <div className="w-80 border-l bg-muted/20 overflow-y-auto">
            <AdPreviewPanel
              formData={formData}
              fileInfo={fileInfo}
              platform={platform}
            />
          </div>
        </form>
      </Form>
    </ValidationProvider>
  );
}
