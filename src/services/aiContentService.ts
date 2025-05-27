
import { supabase } from '@/integrations/supabase/client';

interface AIGenerationRequest {
  prompt: string;
  language: string;
  platform: string;
}

interface AIGeneratedContent {
  headlines: string[];
  descriptions: string[];
  main_texts: string[];
  keywords: string[];
  brand_name?: string;
}

export const generateAdContent = async (request: AIGenerationRequest): Promise<AIGeneratedContent> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-ad-content', {
      body: request
    });

    if (error) {
      console.error('Error calling AI generation function:', error);
      throw new Error(error.message || 'Failed to generate content');
    }

    return data;
  } catch (error) {
    console.error('Error in generateAdContent:', error);
    throw error;
  }
};
