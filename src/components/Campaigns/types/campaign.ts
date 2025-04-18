
export interface AdFormData {
  name: string;
  adset_id: string;
  headline?: string;
  description?: string;
  main_text?: string;
  keywords?: string;
  brand_name?: string;
  cta_button?: string | null;
  url?: string | null;
  // Add variation fields
  headline_variations?: { text: string }[];
  description_variations?: { text: string }[];
  main_text_variations?: { text: string }[];
  keywords_variations?: { text: string }[];
  // Add other fields as needed
  [key: string]: any; // Allow dynamic field access with index signature
}

export interface AdSetFormData {
  name: string;
  campaign_id: string;
  budget?: number;
  targeting?: string;  // Changed back to targeting to match database schema
  start_date?: string;
  end_date?: string;
}

export type Platform = 'Meta' | 'Google' | 'LinkedIn' | 'Snapchat' | 'Tiktok';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  platform: Platform;
  budget?: number;
  company_id?: string;
  associated_user_id?: string;
  created_at: string;
  // Add the missing properties
  is_ongoing?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  companies?: {
    name: string;
  };
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url?: string | null;
  } | null;
}

export interface CampaignFormData {
  name: string;
  description?: string;
  platform: Platform;
  budget?: number;
  company_id?: string;
  associated_user_id?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  // Add missing properties to match Campaign
  is_ongoing?: boolean;
  start_date?: Date | null;
  end_date?: Date | null;
}

export const PLATFORM_COLORS = {
  Meta: {
    bg: '#0081FB',
    text: '#FFFFFF'
  },
  Google: {
    bg: '#34A853',
    text: '#FFFFFF'
  },
  LinkedIn: {
    bg: '#0077B5',
    text: '#FFFFFF'
  },
  Snapchat: {
    bg: '#FFFC00',
    text: '#000000'
  },
  Tiktok: {
    bg: '#000000',
    text: '#FFFFFF'
  },
};

export const PLATFORM_CHARACTER_LIMITS = {
  Meta: {
    headline: 40,
    description: 30,
    main_text: 125,
  },
  Google: {
    headline: 30,
    description: 90,
    keywords: 80,
  },
  LinkedIn: {
    headline: 50,
    description: 60,
    main_text: 150,
  },
  Snapchat: {
    headline: 34,
    brand_name: 25,
  },
  Tiktok: {
    headline: 40,
  }
};
