
import { z } from 'zod';
import type { Company } from '@/types/company';

// Form schema for all stages
export const companyFormSchema = z.object({
  // Stage 1: Basic Info
  name: z.string().min(1, { message: 'Company name is required' }),
  organization_number: z.string().min(1, { message: 'Organization number is required' }),
  client_types: z.array(z.string()).min(1, { message: 'At least one client type is required' }),
  
  // Stage 2: Contact Details
  website: z.string().url({ message: 'Please enter a valid website URL' }),
  phone: z.string().min(1, { message: 'Phone number is required' }),
  invoice_email: z.string().email({ message: 'Please enter a valid email address' }),
  
  // Stage 3: Address & Settings
  street_address: z.string().min(1, { message: 'Street address is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  postal_code: z.string().min(1, { message: 'Postal code is required' }),
  country: z.string().optional(),
  parent_id: z.string().optional(),
  trial_period: z.boolean().default(false),
  is_partner: z.boolean().default(false),
  advisor_id: z.string().min(1, { message: 'Please select an advisor' }),
  mrr: z.number().min(0, { message: 'MRR must be 0 or greater' }),
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
