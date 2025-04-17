
export type FileInfo = {
  url: string;
  type: string;
  file: File;
};

export interface WatchedFields {
  headline: string;
  description: string;
  main_text: string;
  keywords: string;
  brand_name: string;
  cta_button?: string | null;
}

export interface AdPreviewProps {
  fileInfo: FileInfo | null;
  watchedFields: WatchedFields;
  platform: string;
  limits: Record<string, number>;
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
