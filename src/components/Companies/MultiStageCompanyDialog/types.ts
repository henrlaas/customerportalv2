import { z } from 'zod';
import type { Company } from '@/types/company';

// Individual stage schemas
export const stage1Schema = z.object({
  // For stage 2 (Basic Info) - stage numbering starts at 0
  name: z.string().min(1, { message: 'Company name is required' }),
  organization_number: z.string().min(1, { message: 'Organization number is required' }),
  client_types: z.array(z.string()).min(1, { message: 'At least one client type is required' }),
});

export const stage2Schema = z.object({
  // For stage 3 (Contact Details)
  website: z.string().url().min(1, { message: 'URL is required' }),
  phone: z.string().optional(),
  invoice_email: z.string().email().or(z.literal('')).optional(),
});

export const stage3Schema = z.object({
  // For stage 4 (Address & Settings)
  street_address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  parent_id: z.string().optional(),
  trial_period: z.boolean().default(false),
  is_partner: z.boolean().default(false),
  advisor_id: z.string().optional(),
  mrr: z.coerce.number().min(0, { message: 'MRR cannot be negative' }).optional(),
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
