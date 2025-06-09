
import * as z from 'zod';

export const convertTempCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  organization_number: z.string().optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone number is required'),
  invoice_email: z.string().email('Please enter a valid email address'),
  street_address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  client_types: z.array(z.string()).min(1, 'At least one client type must be selected'),
  mrr: z.number().min(0, 'MRR must be a positive number'),
  trial_period: z.boolean().default(false),
  is_partner: z.boolean().default(false),
  advisor_id: z.string().min(1, 'Advisor is required'),
});

export type ConvertTempCompanyFormValues = z.infer<typeof convertTempCompanySchema>;

export interface AdvisorOption {
  value: string;
  label: string;
  avatar_url?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string;
  role?: string;
}
