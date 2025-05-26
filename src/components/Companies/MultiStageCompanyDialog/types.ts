
import { z } from 'zod';
import type { Company } from '@/types/company';

// Stage-specific schemas
export const basicInfoSchema = z.object({
  name: z.string().min(1, { message: 'Company name is required' }),
  organization_number: z.string().min(1, { message: 'Organization number is required' }),
  client_types: z.array(z.string()).min(1, { message: 'At least one client type is required' }),
});

export const contactDetailsSchema = z.object({
  website: z.string().url({ message: 'Please enter a valid website URL' }).min(1, { message: 'Website is required' }),
  phone: z.string().min(1, { message: 'Phone number is required' }),
  invoice_email: z.string().email({ message: 'Please enter a valid email address' }).min(1, { message: 'Invoice email is required' }),
});

export const addressSettingsSchema = z.object({
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

// Full form schema for final submission
export const companyFormSchema = basicInfoSchema.merge(contactDetailsSchema).merge(addressSettingsSchema);

export type CompanyFormValues = z.infer<typeof companyFormSchema>;
export type BasicInfoValues = z.infer<typeof basicInfoSchema>;
export type ContactDetailsValues = z.infer<typeof contactDetailsSchema>;
export type AddressSettingsValues = z.infer<typeof addressSettingsSchema>;

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
