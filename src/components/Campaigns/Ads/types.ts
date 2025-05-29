
export interface FileInfo {
  file: File | null;
  url?: string;
  type: 'image' | 'video' | 'text';
}

export interface WatchedFields {
  headline: string;
  description: string;
  main_text: string;
  keywords: string;
  brand_name: string;
  cta_button?: string | null;
  url?: string | null;
}

export interface AdPreviewProps {
  fileInfo: FileInfo | null;
  watchedFields: WatchedFields;
  platform: string;
  limits: Record<string, number>;
  variation?: number;
}

export interface TextVariation {
  text: string;
}

export interface Comment {
  id: string;
  x: number;
  y: number;
  text: string;
  isResolved: boolean;
  created_at?: string;
  user_id?: string;
  comment_type?: 'point_comment' | 'general_comment' | 'approval_comment';
  parent_comment_id?: string;
}

export interface MediaUpload {
  id: string;
  ad_id: string;
  file_url: string;
  file_type: string;
  file_name?: string;
  file_size?: number;
  uploaded_by?: string;
  uploaded_at: string;
  is_current: boolean;
  replaced_at?: string;
  comments_resolved: boolean;
}

export const CTA_BUTTON_OPTIONS = [
  'No button',
  'Get a quote',
  'Search now',
  'Book now',
  'Contact us',
  'Download',
  'Get promotions',
  'See showtimes',
  'Find out more',
  'Listen now',
  'Get access',
  'Book an appointment',
  'See menu',
  'Get updates',
  'Buy now',
  'Sign up',
  'Subscribe',
  'See more'
];
