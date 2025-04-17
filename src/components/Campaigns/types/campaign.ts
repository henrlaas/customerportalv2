
export type Platform = 'Meta' | 'Tiktok' | 'Google' | 'Snapchat' | 'LinkedIn';

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  company_id: string;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  platform: Platform | null;
  is_ongoing: boolean | null;
  associated_user_id: string | null;
  // Joined fields
  companies?: {
    name: string;
  };
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export interface Adset {
  id: string;
  name: string;
  targeting: string | null;
  campaign_id: string;
  created_at: string;
  updated_at: string;
  ads?: Ad[];
}

export interface Ad {
  id: string;
  name: string;
  adset_id: string;
  ad_type: string;
  file_type: string;
  file_url: string;
  headline?: string | null;
  description?: string | null;
  main_text?: string | null;
  keywords?: string | null;
  brand_name?: string | null;
  created_at: string;
  updated_at: string;
}

export const PLATFORM_COLORS = {
  Meta: { 
    bg: '#e7f3ff', 
    text: 'text-blue-900', 
    icon: 'facebook' 
  },
  Tiktok: { 
    bg: '#f4f4f5', 
    text: 'text-zinc-900',
    icon: 'tiktok'
  },
  Google: { 
    bg: '#f0f9ff', 
    text: 'text-sky-900',
    icon: 'google' 
  },
  Snapchat: { 
    bg: '#fef9c3', 
    text: 'text-yellow-900',
    icon: 'snapchat' 
  },
  LinkedIn: { 
    bg: '#dbeafe', 
    text: 'text-blue-900',
    icon: 'linkedin' 
  }
};

// Add the missing interfaces and constants
export interface AdFormData {
  name: string;
  adset_id: string;
  headline?: string;
  description?: string;
  main_text?: string;
  keywords?: string;
  brand_name?: string;
}

export interface AdSetFormData {
  name: string;
  campaign_id: string;
  targeting?: string;
}

export interface CampaignFormData {
  name: string;
  description?: string;
  platform?: Platform;
  budget?: number;
  start_date?: Date;
  end_date?: Date;
  company_id: string;
  is_ongoing?: boolean;
  associated_user_id?: string;
  status: string;
}

export const PLATFORM_CHARACTER_LIMITS: Record<Platform, Record<string, number>> = {
  Meta: {
    headline: 40,
    description: 125,
    main_text: 300,
  },
  Tiktok: {
    headline: 30,
    description: 100,
  },
  Google: {
    headline: 30,
    description: 90,
    keywords: 100,
  },
  Snapchat: {
    headline: 34,
    brand_name: 25,
  },
  LinkedIn: {
    headline: 70,
    description: 150,
    main_text: 600,
  }
};
