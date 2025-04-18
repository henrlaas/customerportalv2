export interface TextVariation {
  text: string;
  order: number;
}

export interface TextVariations {
  headline?: TextVariation[];
  description?: TextVariation[];
  main_text?: TextVariation[];
  keywords?: TextVariation[];
}

export interface AdFormStep {
  title: string;
  description?: string;
  showFileUpload?: boolean;
  showPreview?: boolean;
  fields: string[];
}

export interface PlatformSteps {
  Meta: AdFormStep[];
  Google: AdFormStep[];
  LinkedIn: AdFormStep[];
  Snapchat: AdFormStep[];
  Tiktok: AdFormStep[];
}

export const PLATFORM_STEPS: PlatformSteps = {
  Meta: [
    {
      title: 'Ad Details',
      description: 'Start by giving your ad a name and uploading media',
      showFileUpload: true,
      fields: ['name']
    },
    {
      title: 'Primary Text',
      description: 'Set your primary ad content',
      showPreview: true,
      fields: ['headline', 'description', 'main_text', 'cta_button', 'url']
    },
    {
      title: 'Variation 2',
      showPreview: true,
      fields: ['headline', 'description', 'main_text']
    },
    {
      title: 'Variation 3',
      showPreview: true,
      fields: ['headline', 'description', 'main_text']
    },
    {
      title: 'Variation 4',
      showPreview: true,
      fields: ['headline', 'description', 'main_text']
    },
    {
      title: 'Variation 5',
      showPreview: true,
      fields: ['headline', 'description', 'main_text']
    }
  ],
  LinkedIn: [
    {
      title: 'Ad Details',
      description: 'Start by giving your ad a name and uploading media',
      showFileUpload: true,
      fields: ['name']
    },
    {
      title: 'Primary Text',
      description: 'Set your primary ad content',
      showPreview: true,
      fields: ['headline', 'description', 'main_text', 'cta_button', 'url']
    },
    {
      title: 'Variation 2',
      showPreview: true,
      fields: ['headline', 'description', 'main_text']
    },
    {
      title: 'Variation 3',
      showPreview: true,
      fields: ['headline', 'description', 'main_text']
    },
    {
      title: 'Variation 4',
      showPreview: true,
      fields: ['headline', 'description', 'main_text']
    },
    {
      title: 'Variation 5',
      showPreview: true,
      fields: ['headline', 'description', 'main_text']
    }
  ],
  Google: [
    {
      title: 'Ad Name',
      description: 'Give your ad a name',
      fields: ['name']
    },
    {
      title: 'Headlines',
      description: 'Add up to 10 different headlines',
      fields: Array(10).fill('headline')
    },
    {
      title: 'Descriptions',
      description: 'Add up to 4 different descriptions',
      fields: Array(4).fill('description')
    },
    {
      title: 'Keywords',
      description: 'Add up to 5 different keywords',
      fields: Array(5).fill('keywords')
    },
    {
      title: 'Final Details',
      description: 'Add URL and review your ad',
      showPreview: true,
      fields: ['url']
    }
  ],
  Snapchat: [
    {
      title: 'Ad Details',
      description: 'Upload your media and give your ad a name',
      showFileUpload: true,
      fields: ['name']
    },
    {
      title: 'Ad Content',
      description: 'Add your brand name and headline',
      showPreview: true,
      fields: ['brand_name', 'headline', 'url']
    }
  ],
  Tiktok: [
    {
      title: 'Ad Details',
      description: 'Upload your media and give your ad a name',
      showFileUpload: true,
      fields: ['name']
    },
    {
      title: 'Ad Content',
      description: 'Add your headline and URL',
      showPreview: true,
      fields: ['headline', 'url']
    }
  ]
};
