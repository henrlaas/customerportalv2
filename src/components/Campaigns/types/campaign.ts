
export type Platform = 'Meta' | 'Tiktok' | 'Google' | 'Snapchat' | 'LinkedIn';

export interface CampaignFormData {
  name: string;
  company_id: string;
  platform: Platform;
  start_date: Date | null;
  end_date: Date | null;
  budget: number | null;
  description?: string | null;
}

export interface AdSetFormData {
  name: string;
  targeting: string;
  campaign_id: string;
}

export interface AdFormData {
  name: string;
  adset_id: string;
  headline?: string;
  description?: string;
  main_text?: string;
  keywords?: string;
  brand_name?: string;
}

export const PLATFORM_CHARACTER_LIMITS = {
  Meta: {
    main_text: 255,
    headline: 90,
    description: 30
  },
  LinkedIn: {
    main_text: 255,
    headline: 90,
    description: 30
  },
  Google: {
    headline: 30,
    description: 90,
    keywords: 30
  },
  Snapchat: {
    brand_name: 32,
    headline: 34
  },
  Tiktok: {
    headline: 100
  }
};
