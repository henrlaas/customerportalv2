
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';
import { Platform } from '../../types/campaign';
import { generateAdContent } from '@/services/aiContentService';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Props {
  form: any;
  platform: Platform;
  onGenerated: () => void;
}

export function AIContentAssistant({ form, platform, onGenerated }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState('');
  const [language, setLanguage] = React.useState('norwegian');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { toast } = useToast();
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Missing prompt',
        description: 'Please provide a description for your ad.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const generatedContent = await generateAdContent({
        prompt,
        language,
        platform,
      });
      
      // Pre-fill form fields with generated content
      if (generatedContent.headlines?.length > 0) {
        form.setValue('headline', generatedContent.headlines[0]);
        generatedContent.headlines.forEach((headline, index) => {
          if (index > 0) {
            form.setValue(`headline_variations.${index - 1}.text`, headline);
          }
        });
      }
      
      if (generatedContent.descriptions?.length > 0) {
        form.setValue('description', generatedContent.descriptions[0]);
        generatedContent.descriptions.forEach((description, index) => {
          if (index > 0) {
            form.setValue(`description_variations.${index - 1}.text`, description);
          }
        });
      }
      
      if (generatedContent.main_texts?.length > 0) {
        form.setValue('main_text', generatedContent.main_texts[0]);
        generatedContent.main_texts.forEach((mainText, index) => {
          if (index > 0) {
            form.setValue(`main_text_variations.${index - 1}.text`, mainText);
          }
        });
      }
      
      if (generatedContent.keywords?.length > 0) {
        form.setValue('keywords', generatedContent.keywords[0]);
        generatedContent.keywords.forEach((keywords, index) => {
          if (index > 0) {
            form.setValue(`keywords_variations.${index - 1}.text`, keywords);
          }
        });
      }
      
      if (generatedContent.brand_name) {
        form.setValue('brand_name', generatedContent.brand_name);
      }
      
      toast({
        title: 'Content generated!',
        description: 'AI has pre-filled your ad content. You can edit it below.',
      });
      
      onGenerated();
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-primary/5 transition-colors">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Content Assistant
              <span className="text-xs text-muted-foreground ml-auto">
                {isOpen ? 'Collapse' : 'Expand'}
              </span>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe your product, target audience, and desired tone..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
              maxLength={500}
            />
            
            <div className="flex gap-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="norwegian">Norwegian</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
