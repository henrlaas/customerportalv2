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
  variation?: number; // Add variation number
}

export interface TextVariation {
  text: string;
}

export const CTA_BUTTON_OPTIONS = [
  'No button',
  'Learn More',
  'Sign Up',
  'Shop Now',
  'Download',
  'Subscribe',
  'Contact Us',
  'Book Now',
  'Apply Now',
  'Get Offer',
  'Get Quote'
];
