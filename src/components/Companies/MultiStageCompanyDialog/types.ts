
import { z } from 'zod';
import type { Company } from '@/types/company';

// Individual stage schemas
export const stage1Schema = z.object({
  // For stage 2 (Basic Info) - stage numbering starts at 0
  name: z.string().min(1, { message: 'Company name is required' }),
  organization_number: z.string().optional(), // Made optional for temp company conversion
  client_types: z.array(z.string()).min(1, { message: 'At least one client type is required' }),
});

export const stage2Schema = z.object({
  // For stage 3 (Contact Details)
  website: z.string().url().min(1, { message: 'URL is required' }),
  phone: z.string()
    .min(1, { message: 'Phone number is required' })
    .refine((val) => {
      // Extract only digits from the phone number
      const digitsOnly = val.replace(/\D/g, '');
      return digitsOnly.length >= 6;
    }, { message: 'Phone number must contain at least 6 digits' }),
  invoice_email: z.string()
    .min(1, { message: 'Invoice email is required' })
    .email({ message: 'Please enter a valid email address' }),
});

export const stage3Schema = z.object({
  // For stage 4 (Address & Settings)
  street_address: z.string().min(1, { message: 'Street address is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  postal_code: z.string().min(1, { message: 'Postal code is required' }),
  country: z.string().optional(),
  parent_id: z.string().optional(),
  trial_period: z.boolean().default(false),
  is_partner: z.boolean().default(false),
  advisor_id: z.string().min(1, { message: 'Please select an advisor' }),
  mrr: z.coerce.number()
    .min(0, { message: 'Monthly recurring revenue must be at least 0' })
    .default(0),
});

// Keep the full schema by combining all stage schemas
export const companyFormSchema = z.object({
  ...stage1Schema.shape,
  ...stage2Schema.shape,
  ...stage3Schema.shape,
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;

export interface MultiStageCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string;
  parentCompany?: Company;
  defaultValues?: Partial<CompanyFormValues>;
  dealId?: string;
}

// Brunnøysund API types
export interface BrregCompany {
  organisasjonsnummer: string;
  navn: string;
  forretningsadresse?: {
    land?: string;
    postnummer?: string;
    poststed?: string;
    adresse?: string[];
  };
}

export interface BrregResponse {
  _embedded?: {
    enheter: BrregCompany[];
  };
}

export type CreationMethod = 'manual' | 'brunnøysund';
