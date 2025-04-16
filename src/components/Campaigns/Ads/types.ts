
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
}

export interface AdPreviewProps {
  fileInfo: FileInfo | null;
  watchedFields: WatchedFields;
  platform: string;
  limits: Record<string, number>;
}
