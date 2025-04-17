
export type Platform = 'Facebook' | 'Instagram' | 'LinkedIn' | 'Google' | 'Meta' | 'Tiktok' | 'Snapchat';

export interface Campaign {
  id: string;
  created_at?: string;
  name: string;
  description?: string;
  company_id: string;
  start_date: string | null;
  end_date: string | null;
  is_ongoing: boolean;
  budget: number | null;
  platform: Platform | null;
  status: string;
  associated_user_id: string | null;
  companies?: {
    name: string;
  };
  profiles: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const PLATFORM_COLORS = {
  Facebook: {
    bg: '#1877F2',
    text: '#fff'
  },
  Instagram: {
    bg: '#E4405F',
    text: '#fff'
  },
  LinkedIn: {
    bg: '#0A66C2',
    text: '#fff'
  },
  Google: {
    bg: '#fff',
    text: '#4285F4'
  },
  Meta: {
    bg: '#0081FB',
    text: '#fff'
  },
  Tiktok: {
    bg: '#000000',
    text: '#fff'
  },
  Snapchat: {
    bg: '#FFFC00',
    text: '#000'
  }
};

export interface AdSetFormData {
  name: string;
  targeting?: string;
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

export interface CampaignFormData {
  name: string;
  company_id: string;
  platform: Platform;
  description?: string | null;
  is_ongoing: boolean;
  start_date: Date | null;
  end_date: Date | null;
  budget: number | null;
  include_subsidiaries?: boolean;
  associated_user_id: string;
}

export const PLATFORM_CHARACTER_LIMITS = {
  Facebook: {
    headline: 40,
    description: 125,
    main_text: 300,
  },
  Instagram: {
    headline: 40,
    description: 125,
    main_text: 300,
  },
  Meta: {
    headline: 40,
    description: 125,
    main_text: 300,
  },
  LinkedIn: {
    headline: 150,
    description: 150,
    main_text: 600,
  },
  Google: {
    headline: 30,
    description: 90,
    keywords: 50,
  },
  Tiktok: {
    headline: 100,
  },
  Snapchat: {
    headline: 34,
    brand_name: 25,
  }
};
