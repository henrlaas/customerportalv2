
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
  price_type?: 'MRR' | 'Project' | null;
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

// Temp deal company type with enhanced address fields
export type TempDealCompany = {
  id: string;
  deal_id: string;
  company_name: string;
  organization_number?: string | null;
  website?: string | null;
  street_address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
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

// Schema for new company form - make org number and website required for manual creation
export const newCompanyFormSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  organization_number: z.string().min(1, 'Organization number is required'),
  website: z.string().url('Please enter a valid URL').min(1, 'Website is required'),
  // Address fields for Brunnøysund API data
  street_address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
});

// Schema for contact form
export const contactFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  position: z.string().optional(),
});

// Schema for deal details stage 1
export const dealDetailsStage1Schema = z.object({
  title: z.string().min(1, 'Deal title is required'),
  description: z.string().min(1, 'Deal description is required'),
});

// Schema for deal details stage 2
export const dealDetailsStage2Schema = z.object({
  deal_type: z.enum(['recurring', 'one-time']),
  client_deal_type: z.enum(['marketing', 'web']),
  value: z.number().min(0, 'Value must be 0 or higher'),
  price_type: z.enum(['MRR', 'Project']),
  assigned_to: z.string().optional(),
});

// Combined schema for deal details form
export const dealDetailsFormSchema = z.object({
  ...dealDetailsStage1Schema.shape,
  ...dealDetailsStage2Schema.shape,
});

export type NewCompanyFormValues = z.infer<typeof newCompanyFormSchema>;
export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type DealDetailsStage1Values = z.infer<typeof dealDetailsStage1Schema>;
export type DealDetailsStage2Values = z.infer<typeof dealDetailsStage2Schema>;
export type DealDetailsFormValues = z.infer<typeof dealDetailsFormSchema>;
