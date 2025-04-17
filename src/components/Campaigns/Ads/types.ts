
export interface WatchedFields {
  headline: string;
  description: string;
  main_text: string;
  keywords: string;
  brand_name: string;
  cta_button?: string | null;
  url?: string | null;  // Add URL to watched fields
}

export interface AdPreviewProps {
  fileInfo: FileInfo | null;
  watchedFields: WatchedFields;
  platform: string;
  limits: Record<string, number>;
}
