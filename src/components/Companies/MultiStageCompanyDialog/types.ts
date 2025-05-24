
import { z } from 'zod';
import type { Company } from '@/types/company';

// Form schema for all stages
export const companyFormSchema = z.object({
  // Stage 1: Basic Info
  name: z.string().min(1, { message: 'Company name is required' }),
  organization_number: z.string().optional(),
  client_types: z.array(z.string()).min(1, { message: 'At least one client type is required' }),
  
  // Stage 2: Contact Details
  website: z.string().url().or(z.literal('')).optional(),
  phone: z.string().optional(),
  invoice_email: z.string().email().or(z.literal('')).optional(),
  
  // Stage 3: Address & Settings
  street_address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  parent_id: z.string().optional(),
  trial_period: z.boolean().default(false),
  is_partner: z.boolean().default(false),
  advisor_id: z.string().optional(),
  mrr: z.coerce.number().optional(),
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
export interface BrunnøysundCompany {
  organisasjonsnummer: string;
  navn: string;
  forretningsadresse?: {
    land?: string;
    postnummer?: string;
    poststed?: string;
    adresse?: string[];
  };
}

export interface BrunnøysundResponse {
  _embedded: {
    enheter: BrunnøysundCompany[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export type CreationMethod = 'brunnøysund' | 'manual';
