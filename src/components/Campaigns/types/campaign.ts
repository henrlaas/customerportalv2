export type Platform = 'Facebook' | 'Instagram' | 'LinkedIn' | 'Google';

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
  }
};

export interface AdSetFormData {
  name: string;
  targeting?: string;
  campaign_id: string;
}
