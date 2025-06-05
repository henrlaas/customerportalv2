import { z } from 'zod';

// Deal type matching our database schema
export type Deal = {
  id: string;
  title: string;
  description: string | null;
  company_id: string | null;
  stage_id: string | null;
  value: number | null;
  probability: number | null;
  expected_close_date: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  is_recurring: boolean | null;
  deal_type?: 'recurring' | 'one-time' | null;
  client_deal_type?: 'marketing' | 'web' | null;
};

// Company type for selecting related companies
export type Company = {
  id: string;
  name: string;
  parent_id?: string | null;
};

// Stage type for deal stages
export type Stage = {
  id: string;
  name: string;
  position: number;
};

// Profile type for assigned to
export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  avatar_url?: string | null;
};

// Temp deal company type
export type TempDealCompany = {
  id: string;
  deal_id: string;
  company_name: string;
  organization_number?: string | null;
  website?: string | null;
  created_at: string;
  created_by?: string | null;
};

// Temp deal contact type
export type TempDealContact = {
  id: string;
  deal_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  created_at: string;
  created_by?: string | null;
};

// Schema for new company form
export const newCompanyFormSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  organization_number: z.string().optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

// Schema for contact form
export const contactFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  position: z.string().optional(),
});

// Schema for deal details form
export const dealDetailsFormSchema = z.object({
  title: z.string().min(1, 'Deal title is required'),
  description: z.string().optional(),
  deal_type: z.enum(['recurring', 'one-time']),
  client_deal_type: z.enum(['marketing', 'web']),
  value: z.number().min(0, 'Value must be a positive number'),
  assigned_to: z.string().optional(),
});

export type NewCompanyFormValues = z.infer<typeof newCompanyFormSchema>;
export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type DealDetailsFormValues = z.infer<typeof dealDetailsFormSchema>;
