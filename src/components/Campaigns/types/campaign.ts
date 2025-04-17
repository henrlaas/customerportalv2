
export interface AdFormData {
  name: string;
  adset_id: string;
  headline?: string;
  description?: string;
  main_text?: string;
  keywords?: string;
  brand_name?: string;
  cta_button?: string | null;
  url?: string | null;  // Add URL to AdFormData
}
