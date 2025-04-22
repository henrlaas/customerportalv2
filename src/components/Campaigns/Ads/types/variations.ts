
import { AdFormData, Platform } from '../../types/campaign';
import { FileInfo } from '../types';

export interface TextVariation {
  text: string;
}

export interface AdFormStep {
  title: string;
  description?: string;
  fields?: string[];
  showBasicFields?: boolean;
}

export const getStepsForPlatform = (platform: Platform): AdFormStep[] => {
  switch (platform) {
    case 'Meta':
    case 'LinkedIn':
      return [
        { 
          title: 'Basic Info', 
          description: 'Set your ad name and upload media',
          showBasicFields: true
        },
        { 
          title: 'Variation 1', 
          description: 'Create your first ad variation',
          fields: ['headline', 'description', 'main_text', 'cta_button', 'url'],
          showBasicFields: true
        },
        { 
          title: 'Variation 2', 
          description: 'Add alternative headline, description and text',
          fields: ['headline', 'description', 'main_text']
        },
        { 
          title: 'Variation 3',
          description: 'Add alternative headline, description and text',
          fields: ['headline', 'description', 'main_text']
        },
        { 
          title: 'Variation 4',
          description: 'Add alternative headline, description and text',
          fields: ['headline', 'description', 'main_text']
        },
        { 
          title: 'Variation 5',
          description: 'Add alternative headline, description and text',
          fields: ['headline', 'description', 'main_text']
        }
      ];
    case 'Google':
      return [
        { 
          title: 'Basic Info', 
          description: 'Set your ad name',
          showBasicFields: true
        },
        { 
          title: 'Headlines', 
          description: 'Add up to 10 different headlines for your ad',
          fields: Array(10).fill('headline')
        },
        { 
          title: 'Descriptions', 
          description: 'Add up to 4 different descriptions for your ad',
          fields: Array(4).fill('description')
        },
        { 
          title: 'Keywords', 
          description: 'Add up to 5 different keyword sets for your ad',
          fields: Array(5).fill('keywords')
        },
        { 
          title: 'URL', 
          description: 'Set the URL where users will be directed',
          fields: ['url'],
          showBasicFields: true
        }
      ];
    case 'Snapchat':
      return [
        { 
          title: 'Basic Info', 
          description: 'Set your ad name and upload media',
          showBasicFields: true
        },
        { 
          title: 'Ad Content', 
          description: 'Enter brand name, headline and URL',
          fields: ['brand_name', 'headline', 'url'],
          showBasicFields: true
        }
      ];
    case 'Tiktok':
      return [
        { 
          title: 'Basic Info', 
          description: 'Set your ad name and upload media',
          showBasicFields: true
        },
        { 
          title: 'Ad Content', 
          description: 'Enter headline and URL',
          fields: ['headline', 'url'],
          showBasicFields: true
        }
      ];
    default:
      return [
        { 
          title: 'Basic Info',
          showBasicFields: true
        },
        { 
          title: 'Ad Content',
          showBasicFields: true
        }
      ];
  }
};

export const getFieldsForPlatform = (platform: Platform): string[] => {
  switch (platform) {
    case 'Meta':
    case 'LinkedIn':
      return ['headline', 'description', 'main_text', 'cta_button', 'url'];
    case 'Google':
      return ['headline', 'description', 'keywords', 'url'];
    case 'Snapchat':
      return ['brand_name', 'headline', 'url'];
    case 'Tiktok':
      return ['headline', 'url'];
    default:
      return ['headline', 'description', 'url'];
  }
};

export const requiresMediaUpload = (platform: Platform): boolean => {
  return platform !== 'Google';
};

export const getCurrentVariationFields = (step: number, platform: Platform): string[] => {
  const steps = getStepsForPlatform(platform);
  if (step < 0 || step >= steps.length) return [];
  return steps[step].fields || [];
};

export const getMaxVariationsCount = (platform: Platform, fieldType: string): number => {
  switch (platform) {
    case 'Meta':
    case 'LinkedIn':
      return 5; // 5 variations for all field types
    case 'Google':
      if (fieldType === 'headline') return 10; // 10 headline variations
      if (fieldType === 'description') return 4; // 4 description variations
      if (fieldType === 'keywords') return 5; // 5 keyword variations
      return 1;
    default:
      return 1; // Default is just 1 variation
  }
};
