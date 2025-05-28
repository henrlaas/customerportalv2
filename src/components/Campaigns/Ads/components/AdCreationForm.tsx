
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
        <form onSubmit={handleSubmit} className="flex h-full w-full">
          {/* Left Panel - Form Fields with Scrollbar */}
          <div className="flex-1 flex flex-col min-w-0">
            <ScrollArea className="flex-1 h-[calc(95vh-140px)]">
              <div className="p-8 pr-4">
                <div className="space-y-8 w-full max-w-2xl">
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
                  
                  {/* Extra padding to ensure scrolling */}
                  <div className="h-32" />
                </div>
              </div>
            </ScrollArea>
            
            {/* Submit Button - Fixed at bottom */}
            <div className="flex-shrink-0 p-8 pt-4 border-t bg-background">
              <div className="max-w-2xl">
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
          </div>
          
          {/* Right Panel - Preview */}
          <div className="w-96 border-l bg-muted/20 flex-shrink-0">
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
